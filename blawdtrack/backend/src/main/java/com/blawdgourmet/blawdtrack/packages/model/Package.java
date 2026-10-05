package com.blawdgourmet.blawdtrack.packages.model;

import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.users.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Paquete/Envío en el sistema. Contiene información general, del cliente, de entrega y del mensajero asignado.
 */
@Entity
@Table(name = "paquetes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Package {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_envio", nullable = false, unique = true, length = 50)
    private String shipmentNumber;

    // Datos generales del paquete
    @Column(name = "descripcion", length = 500)
    private String description;

    @Column(name = "peso_kg", precision = 10, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "largo_cm", precision = 10, scale = 2)
    private BigDecimal lengthCm;

    @Column(name = "ancho_cm", precision = 10, scale = 2)
    private BigDecimal widthCm;

    @Column(name = "alto_cm", precision = 10, scale = 2)
    private BigDecimal heightCm;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private PackageStatus status;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime updatedAt;

    // Datos del cliente
    @Column(name = "cliente_nombre", nullable = false, length = 120)
    private String clientName;

    @Column(name = "cliente_documento", length = 50)
    private String clientDocument;

    @Column(name = "cliente_telefono", length = 20)
    private String clientPhone;

    @Column(name = "cliente_correo", length = 120)
    private String clientEmail;

    @Column(name = "cliente_direccion", length = 300)
    private String clientAddress;

    // Datos de entrega
    @Column(name = "entrega_direccion", nullable = false, length = 300)
    private String deliveryAddress;

    @Column(name = "entrega_ciudad", length = 100)
    private String deliveryCity;

    @Column(name = "entrega_referencia", length = 500)
    private String deliveryReference;

    @Column(name = "entrega_fecha_programada")
    private LocalDateTime scheduledDeliveryDate;

    @Column(name = "entrega_fecha_realizada")
    private LocalDateTime actualDeliveryDate;

    @Column(name = "entrega_observaciones", length = 1000)
    private String deliveryNotes;

    @Column(name = "entrega_firma_receptor", length = 200)
    private String recipientSignature;

    // Mensajero asignado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mensajero_id", foreignKey = @ForeignKey(name = "fk_paquetes_mensajero_id"))
    private Courier assignedCourier;

    // Usuario que creó el paquete (administrador de ventas)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por_id", nullable = false, foreignKey = @ForeignKey(name = "fk_paquetes_creado_por_id"))
    private User createdBy;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = PackageStatus.PENDING;
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}