package com.blawdgourmet.blawdtrack.packages.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.Locale;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "paquetes", uniqueConstraints =
        @UniqueConstraint(name = "uq_paquetes_numero_envio", columnNames = "numero_envio"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_envio", nullable = false, length = 50)
    private String shipmentNumber;

    @Column(name = "numero_orden", length = 50)
    private String orderNumber;

    @Column(name = "nombre_cliente", length = 120)
    private String customerName;

    @Column(name = "direccion_entrega", length = 500)
    private String address;

    @Column(name = "telefono", length = 30)
    private String phone;

    @Column(name = "horario_preferencia", length = 255)
    private String schedule;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private PackageStatus status = PackageStatus.PENDING;

    @Column(name = "hora_inicio_entrega", nullable = false)
    @Builder.Default
    private LocalTime deliveryStartTime = LocalTime.of(9, 0);

    @Column(name = "hora_fin_entrega", nullable = false)
    @Builder.Default
    private LocalTime deliveryEndTime = LocalTime.of(16, 0);

    @PrePersist
    @PreUpdate
    void normalizeShipmentNumber() {
        if (shipmentNumber != null) {
            shipmentNumber = shipmentNumber.trim().toUpperCase(Locale.ROOT);
        }
        if (status == null) {
            status = PackageStatus.PENDING;
        }
    }
}
