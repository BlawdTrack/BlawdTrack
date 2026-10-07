package com.blawdgourmet.blawdtrack.packages.model;

import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.packages.validation.ShipmentNumberNormalizer;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Paquete/Envío en el sistema, alineado con los datos importados desde Zoho.
 */
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

    @Column(name = "telefono", length = 30)
    private String phone;

    @Column(name = "direccion_entrega", length = 500)
    private String address;

    @Column(name = "horario_preferencia", length = 255)
    private String schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mensajero_id", foreignKey = @ForeignKey(name = "fk_paquetes_mensajero_id"))
    private Courier assignedCourier;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private PackageStatus status = PackageStatus.PENDING;

    @OneToMany(mappedBy = "deliveryPackage", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DeliveryPackageItem> items = new ArrayList<>();

    public void addItem(DeliveryPackageItem item) {
        items.add(item);
        item.setDeliveryPackage(this);
    }

    public void removeItem(DeliveryPackageItem item) {
        items.remove(item);
        item.setDeliveryPackage(null);
    }

    @PrePersist
    @PreUpdate
    void normalizeAndDefaultStatus() {
        shipmentNumber = ShipmentNumberNormalizer.normalize(shipmentNumber);
        if (this.status == null) {
            this.status = PackageStatus.PENDING;
        }
    }
}