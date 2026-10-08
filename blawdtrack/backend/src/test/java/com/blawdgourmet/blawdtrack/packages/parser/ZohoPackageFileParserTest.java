package com.blawdgourmet.blawdtrack.packages.parser;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

class ZohoPackageFileParserTest {

    private final ZohoPackageFileParser parser = new ZohoPackageFileParser(
            List.of(new CsvTableReader(), new XlsxTableReader()), new ZohoPackageGrouper());

    @Test
    void agrupaLasLineasDeZohoPorNumeroDeEnvioYConservaEncabezadosDuplicados() {
        String csv = """
                PackageItemID,Packing Number,Notes,SO Number,Customer Name,Item Name,Quantity Packed,SKU,Item Price,Shipping Address,Shipping Address,Shipping City,Shipping State,Shipping Country,Shipping Phone
                101,ENV-00001,,SO-001,Cliente Uno,Blawd Box,1.000000,BOX,9600.000000,,Del parque 100m norte,Escazu,San Jose,Costa Rica,7110-0914
                102,ENV-00001,,SO-001,Cliente Uno,Alfajor 70%,3.000000,,1200.000000,,Del parque 100m norte,Escazu,San Jose,Costa Rica,7110-0914
                103,ENV-00002,De 8 a 5,SO-002,Cliente Dos,Alfajor Cafe,2,,,,Otra direccion,,,,'+506-8888-9999
                """;

        var result = parser.parse(stream(csv), "paquetes.CSV");

        assertThat(result).hasSize(2);
        assertThat(result.getFirst().shipmentNumber()).isEqualTo("ENV-00001");
        assertThat(result.getFirst().orderNumber()).isEqualTo("SO-001");
        assertThat(result.getFirst().address())
                .isEqualTo("Del parque 100m norte, Escazu, San Jose, Costa Rica");
        assertThat(result.getFirst().items()).hasSize(2);
        assertThat(result.getFirst().items().get(1).quantity()).isEqualByComparingTo("3");
        assertThat(result.get(1).schedule()).isEqualTo("De 8 a 5");
        assertThat(result.get(1).phone()).isEqualTo("+506-8888-9999");
    }

    @Test
    void leeXlsxYConvierteUnHorarioNumericoATextoSinPerderLosArticulos() throws Exception {
        byte[] xlsx;
        try (var workbook = new XSSFWorkbook(); var output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("Packages");
            var header = sheet.createRow(0);
            String[] headers = {"Packing Number", "SO Number", "Customer Name", "Shipping Address",
                    "Shipping Phone", "Schedule", "Item Name", "Quantity Packed", "Item Price"};
            for (int index = 0; index < headers.length; index++) {
                header.createCell(index).setCellValue(headers[index]);
            }
            var row = sheet.createRow(1);
            row.createCell(0).setCellValue(" env-00003 ");
            row.createCell(1).setCellValue("SO-003");
            row.createCell(2).setCellValue("Cliente Tres");
            row.createCell(3).setCellValue("Direccion tres");
            row.createCell(4).setCellValue("2222-3333");
            row.createCell(5).setCellValue(800);
            row.createCell(6).setCellValue("Alfajor");
            row.createCell(7).setCellValue(4);
            row.createCell(8).setCellValue(1200);
            workbook.write(output);
            xlsx = output.toByteArray();
        }

        var result = parser.parse(new ByteArrayInputStream(xlsx), "paquetes.xlsx");

        assertThat(result).singleElement().satisfies(deliveryPackage -> {
            assertThat(deliveryPackage.shipmentNumber()).isEqualTo("ENV-00003");
            assertThat(deliveryPackage.schedule()).isEqualTo("800");
            assertThat(deliveryPackage.items()).singleElement().satisfies(item -> {
                assertThat(item.name()).isEqualTo("Alfajor");
                assertThat(item.quantity()).isEqualByComparingTo(BigDecimal.valueOf(4));
            });
        });
    }

    @Test
    void procesaElCsvAnonimizadoDeZohoConCatorceLineasYTresPaquetes() {
        InputStream input = Objects.requireNonNull(getClass().getResourceAsStream(
                "/packages/zoho-paquetes-anonimizados.csv"));

        var result = parser.parse(input, "zoho-paquetes-anonimizados.csv");

        assertThat(result).hasSize(3);
        assertThat(result).extracting(packageData -> packageData.items().size())
                .containsExactly(5, 4, 5);
        assertThat(result).extracting(packageData -> packageData.shipmentNumber())
                .containsExactly("ENV-00953", "ENV-00956", "ENV-00958");
    }

    @Test
    void aceptaCsvUtf8ConBom() {
        String csv = "\uFEFFPacking Number,SO Number,Customer Name\n"
                + "env-1,SO-1,Cliente Uno\n";

        var result = parser.parse(stream(csv), "x.csv");

        assertThat(result).singleElement()
                .extracting(packageData -> packageData.shipmentNumber())
                .isEqualTo("ENV-1");
    }

    @Test
    void conservaRegistrosConCamposObligatoriosVaciosParaValidarlosDespues() {
        String csv = """
                Packing Number,SO Number,Customer Name,Shipping Address,Shipping Phone
                ENV-1,SO-1,Cliente Uno,San Jose,8888-8888
                ,SO-2,,,
                """;

        var result = parser.parse(stream(csv), "paquetes.csv");

        assertThat(result).hasSize(2);
        assertThat(result.getFirst().shipmentNumber()).isEqualTo("ENV-1");
        assertThat(result.get(1).shipmentNumber()).isNull();
        assertThat(result.get(1).customerName()).isEmpty();
        assertThat(result.get(1).address()).isNull();
        assertThat(result.get(1).phone()).isNull();
    }

    @Test
    void rechazaUnArchivoVacio() {
        assertThatThrownBy(() -> parser.parse(stream(""), "x.csv"))
                .isInstanceOf(PackageFileParsingException.class)
                .hasMessage("El archivo no contiene encabezados");
    }

    @Test
    void rechazaUnaCantidadNoNumericaEIndicaLaFila() {
        String csv = """
                Packing Number,SO Number,Customer Name,Item Name,Quantity Packed
                ENV-1,SO-1,Cliente A,Alfajor,mucho
                """;

        assertThatThrownBy(() -> parser.parse(stream(csv), "x.csv"))
                .isInstanceOf(PackageFileParsingException.class)
                .hasMessageContaining("Fila 2")
                .hasMessageContaining("Quantity Packed debe ser numerico");
    }

    @Test
    void rechazaLaComaComoSeparadorDecimalParaNoAlterarElValor() {
        String csv = """
                Packing Number,SO Number,Customer Name,Item Name,Quantity Packed
                ENV-1,SO-1,Cliente A,Alfajor,"1,5"
                """;

        assertThatThrownBy(() -> parser.parse(stream(csv), "x.csv"))
                .isInstanceOf(PackageFileParsingException.class)
                .hasMessageContaining("debe usar punto como separador decimal: 1,5");
    }

    @Test
    void rechazaArchivosSinEncabezadosObligatorios() {
        assertThatThrownBy(() -> parser.parse(
                        stream("Packing Number,Item Name\nENV-1,Alfajor\n"), "x.csv"))
                .isInstanceOf(PackageFileParsingException.class)
                .hasMessage("Falta el encabezado obligatorio: SO Number");
    }

    @Test
    void rechazaDatosContradictoriosDentroDelMismoPaquete() {
        String csv = """
                Packing Number,SO Number,Customer Name,Item Name,Quantity Packed
                ENV-1,SO-1,Cliente A,Alfajor,1
                ENV-1,SO-2,Cliente A,Alfajor,1
                """;

        assertThatThrownBy(() -> parser.parse(stream(csv), "x.csv"))
                .isInstanceOf(PackageFileParsingException.class)
                .hasMessageContaining("Fila 3").hasMessageContaining("SO Number");
    }

    @Test
    void rechazaExtensionesNoCompatibles() {
        assertThatThrownBy(() -> parser.parse(stream("texto"), "paquetes.xls"))
                .isInstanceOf(PackageFileParsingException.class)
                .hasMessage("Formato no compatible. Solo se permiten archivos .csv y .xlsx");
    }

    private static ByteArrayInputStream stream(String value) {
        return new ByteArrayInputStream(value.getBytes(StandardCharsets.UTF_8));
    }
}
