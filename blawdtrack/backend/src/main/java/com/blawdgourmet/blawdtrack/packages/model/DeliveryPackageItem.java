package com.blawdgourmet.blawdtrack.packages.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "paquetes_articulos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryPackageItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "articulo_id", length = 100)
    private String itemId;

    @Column(name = "nombre", length = 255)
    private String name;

    @Column(name = "cantidad", nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity;

    @Column(name = "sku", length = 100)
    private String sku;

    @Column(name = "precio_unitario", precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paquete_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_paquetes_articulos_paquete_id"))
    private DeliveryPackage deliveryPackage;
}
