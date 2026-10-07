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

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private PackageStatus status = PackageStatus.PENDING;

    @PrePersist
    @PreUpdate
    void normalizeShipmentNumber() {
        if (shipmentNumber != null) {
            shipmentNumber = shipmentNumber.trim().toUpperCase(Locale.ROOT);
        }
    }
}
