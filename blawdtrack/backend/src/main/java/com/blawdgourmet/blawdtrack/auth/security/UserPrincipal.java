package com.blawdgourmet.blawdtrack.auth.security;

import com.blawdgourmet.blawdtrack.users.model.Permission;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserPermission;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Adaptador de {@link User} al modelo de Spring Security. Las autoridades son {@code ROLE_} + nombre
 * del rol más los códigos de los permisos del rol; {@link #isEnabled()} refleja si la cuenta está
 * activa. Se reconstruye desde la base en cada solicitud, así los cambios de rol o permisos aplican de
 * inmediato.
 */
public class UserPrincipal implements UserDetails {

    private final User user;
    private final Collection<UserPermission> permissionOverrides;

    public UserPrincipal(User user) {
        this(user, List.of());
    }

    /** {@code permissionOverrides}: excepciones individuales sobre los permisos del rol (HU-009). */
    public UserPrincipal(User user, Collection<UserPermission> permissionOverrides) {
        this.user = user;
        this.permissionOverrides = permissionOverrides;
    }

    public Long getId() {
        return user.getId();
    }

    public User getUser() {
        return user;
    }

    public int getTokenVersion() {
        return user.getTokenVersion();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Stream<GrantedAuthority> role = Stream.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().getName())
        );
        Set<String> permissionCodes = user.getRole().getPermissions().stream()
                .map(Permission::getCode)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        permissionOverrides.forEach(override -> {
            if (override.isAllowed()) {
                permissionCodes.add(override.getPermission().getCode());
            } else {
                permissionCodes.remove(override.getPermission().getCode());
            }
        });
        Stream<GrantedAuthority> permissions = permissionCodes.stream().map(SimpleGrantedAuthority::new);

        return Stream.concat(role, permissions).collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return user.isActive(); }
}
