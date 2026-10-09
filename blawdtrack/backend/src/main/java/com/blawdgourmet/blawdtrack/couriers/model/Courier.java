package com.blawdgourmet.blawdtrack.couriers.model;

import com.blawdgourmet.blawdtrack.users.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

/**
 * Perfil operativo del mensajero. Los datos personales, contacto, hash de
 * contraseña, estado y rol MENSAJERO se mantienen en la cuenta User asociada.
 * El flujo de registro debe asignar el rol existente a esa cuenta.
 */
@Entity
@Table(name = "mensajeros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Courier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private User user;

    // Descripción del horario, por ejemplo: "Lunes a viernes, 08:00-17:00".
    @NotBlank
    @Size(max = 255)
    @Column(name = "horario", nullable = false, length = 255)
    private String schedule;

    @NotNull
    @Positive
    @Digits(integer = 8, fraction = 2)
    @Column(name = "capacidad_maxima_carga_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal maxPackageWeightKg;
}
