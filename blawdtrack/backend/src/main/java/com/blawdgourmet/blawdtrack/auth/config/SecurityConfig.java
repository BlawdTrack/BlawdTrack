package com.blawdgourmet.blawdtrack.auth.config;

import com.blawdgourmet.blawdtrack.auth.security.HttpsEnforcementFilter;
import com.blawdgourmet.blawdtrack.auth.security.JwtAuthenticationFilter;
import com.blawdgourmet.blawdtrack.auth.security.RestAccessDeniedHandler;
import com.blawdgourmet.blawdtrack.auth.security.RestAuthenticationEntryPoint;
import com.blawdgourmet.blawdtrack.users.constant.PermissionCode;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import jakarta.servlet.DispatcherType;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AccountStatusUserDetailsChecker;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final HttpsEnforcementFilter httpsEnforcementFilter;
    private final UserDetailsService userDetailsService;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
    private final RestAccessDeniedHandler restAccessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        provider.setHideUserNotFoundExceptions(true);
        // Comprobar primero la contraseña evita revelar cuentas inactivas
        // a quien no conoce sus credenciales. Todos los estados se validan después.
        provider.setPreAuthenticationChecks(user -> { });
        provider.setPostAuthenticationChecks(new AccountStatusUserDetailsChecker());
        return new ProviderManager(provider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${app.cors.allowed-origins:*}") List<String> allowedOrigins) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource(allowedOrigins)))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(restAuthenticationEntryPoint)
                        .accessDeniedHandler(restAccessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        // Conservar el 403 original cuando Tomcat despacha internamente a /error.
                        // Las solicitudes HTTP directas siguen requiriendo autenticación.
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        // Restablecer la propia contraseña exige sesión (cualquier rol): va ANTES de la
                        // regla pública de /api/v1/auth/**, que es la que coincidiría primero.
                        .requestMatchers("/api/v1/auth/password-reset/request-own", "/api/v1/auth/logout", "/api/v1/auth/session").authenticated()
                        .requestMatchers("/api/v1/auth/**", "/swagger-ui/**", "/v3/api-docs/**", "/actuator/health").permitAll()
                        // La autorizacion se resuelve aqui, antes del binding y la validacion de los
                        // parametros: con solo @PreAuthorize, un rol sin permiso recibiria un 400 de
                        // validacion en lugar del 403 (@PreAuthorize se evalua al invocar el metodo).
                        // Todos los endpoints de AdminController son exclusivos del Super Usuario;
                        // @PreAuthorize en el controlador se mantiene como segunda barrera.
                        .requestMatchers("/api/v1/admins/**").hasRole(RoleName.SUPER_USER)
                        // Hoy todos los endpoints bajo /api/v1/couriers y /api/v1/roles son exclusivos
                        // del Super Usuario. Si se agrega uno bajo el mismo prefijo para otro rol (por
                        // ejemplo, un mensajero consultando sus propios datos), su regla mas especifica
                        // debe declararse ANTES de estas dos: Spring Security aplica la primera que
                        // coincide, y estas reglas de prefijo bloquearian a ese rol con un 403.
                        .requestMatchers("/api/v1/couriers/**").hasRole(RoleName.SUPER_USER)
                        .requestMatchers("/api/v1/roles/**").hasRole(RoleName.SUPER_USER)
                        // Permisos individuales de usuarios (HU-009): exclusivos del Super Usuario.
                        .requestMatchers("/api/v1/users/**").hasRole(RoleName.SUPER_USER)
                        // HU-010: la importacion se autoriza por su permiso funcional.
                        .requestMatchers("/api/v1/packages/import", "/api/v1/packages/import/**")
                        .hasAuthority(PermissionCode.PACKAGE_IMPORT)
                        // Consultar y buscar paquetes (detalle e historial, HU-013; busqueda, HU-014) es del Administrador
                        // de Ventas y del Super Usuario, que tiene acceso a todos los modulos. Va ANTES de la regla de
                        // prefijo: Spring Security aplica la primera que coincide.
                        .requestMatchers(HttpMethod.GET, "/api/v1/packages/**")
                                .hasAnyRole(RoleName.SALES_ADMIN, RoleName.SUPER_USER)
                        // La comparacion de numeros de envio (HU-011) tambien la usa el Super Usuario.
                        .requestMatchers("/api/v1/packages/shipment-numbers/**")
                                .hasAnyRole(RoleName.SALES_ADMIN, RoleName.SUPER_USER)
                        // Eliminar un paquete (HU-012) es del Administrador de Ventas y del Super Usuario, que tiene
                        // acceso a todas las funciones. Va ANTES de la regla de prefijo; @PreAuthorize en el
                        // controlador queda como segunda barrera.
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/packages/*")
                                .hasAnyRole(RoleName.SALES_ADMIN, RoleName.SUPER_USER)
                        // El resto de la gestion de paquetes pertenece al Administrador de Ventas. Esta regla se
                        // evalua antes del binding de los parametros.
                        .requestMatchers("/api/v1/packages/**").hasRole(RoleName.SALES_ADMIN)
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // Antes que todo lo demás: si la petición debe rechazarse por venir en
                // HTTP plano, ni siquiera llega a evaluarse como pública o protegida.
                .addFilterBefore(httpsEnforcementFilter, JwtAuthenticationFilter.class)
                .build();
    }

    /**
     * Habilita CORS para que el frontend de React pueda consumir la API desde un origen distinto.
     * {@code app.cors.allowed-origins} lista los orígenes permitidos separados por comas; sin definir
     * (desarrollo) se aceptan todos, y en un despliegue real debe ser la URL pública del frontend.
     */
    private CorsConfigurationSource corsConfigurationSource(List<String> allowedOrigins) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
