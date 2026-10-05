package com.blawdgourmet.blawdtrack.packages.model;

import java.util.Locale;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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

    @PrePersist
    @PreUpdate
    void normalizeShipmentNumber() {
        if (shipmentNumber != null) {
            shipmentNumber = shipmentNumber.trim().toUpperCase(Locale.ROOT);
        }
    }
}