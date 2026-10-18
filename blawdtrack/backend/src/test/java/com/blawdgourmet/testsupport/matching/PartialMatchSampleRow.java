package com.blawdgourmet.testsupport.matching;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "filas_prueba_coincidencia")
public class PartialMatchSampleRow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_envio")
    private String shipmentNumber;

    @Column(name = "numero_orden")
    private String orderNumber;

    @Column(name = "nombre_cliente")
    private String customerName;

    @Column(name = "direccion_entrega")
    private String address;

    @Column(name = "telefono")
    private String phone;

    @Column(name = "horario_preferencia")
    private String schedule;

    protected PartialMatchSampleRow() {
    }

    public PartialMatchSampleRow(String shipmentNumber, String orderNumber, String customerName,
            String address, String phone, String schedule) {
        this.shipmentNumber = shipmentNumber;
        this.orderNumber = orderNumber;
        this.customerName = customerName;
        this.address = address;
        this.phone = phone;
        this.schedule = schedule;
    }
}