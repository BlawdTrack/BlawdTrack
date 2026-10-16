package com.blawdgourmet.blawdtrack.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.fields;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.GeneralCodingRules.NO_CLASSES_SHOULD_ACCESS_STANDARD_STREAMS;
import static com.tngtech.archunit.library.GeneralCodingRules.NO_CLASSES_SHOULD_USE_JAVA_UTIL_LOGGING;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/**
 * Reglas de diseño (SOLID / POO) que el CI hace cumplir. Cada regla es una señal medible de un principio:
 * no sustituyen la revisión del PR, pero impiden que el diseño se degrade sin que nadie lo note.
 */
@AnalyzeClasses(packages = "com.blawdgourmet.blawdtrack", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureRulesTest {

    // D (inversión de dependencias): las dependencias llegan por constructor, no por campo.
    @ArchTest
    static final ArchRule no_autowired_fields = fields()
            .should().notBeAnnotatedWith("org.springframework.beans.factory.annotation.Autowired")
            .because("la inyección es por constructor");

    // S (responsabilidad única) y capas: cada capa solo habla con la de abajo.
    @ArchTest
    static final ArchRule controllers_do_not_touch_repositories = noClasses()
            .that().resideInAPackage("..controller..")
            .should().dependOnClassesThat().resideInAPackage("..repository..")
            .because("un controlador delega en un servicio, no consulta la base de datos");

    @ArchTest
    static final ArchRule services_do_not_depend_on_controllers = noClasses()
            .that().resideInAPackage("..service..")
            .should().dependOnClassesThat().resideInAPackage("..controller..");

    @ArchTest
    static final ArchRule repositories_do_not_depend_on_services_or_controllers = noClasses()
            .that().resideInAPackage("..repository..")
            .should().dependOnClassesThat().resideInAnyPackage("..service..", "..controller..");

    @ArchTest
    static final ArchRule model_does_not_depend_on_upper_layers = noClasses()
            .that().resideInAnyPackage("..model..", "..entity..")
            .should().dependOnClassesThat().resideInAnyPackage("..service..", "..controller..", "..repository..")
            .because("el dominio no conoce a quienes lo usan");

    @ArchTest
    static final ArchRule dtos_do_not_depend_on_upper_layers = noClasses()
            .that().resideInAPackage("..dto..")
            .should().dependOnClassesThat().resideInAnyPackage("..service..", "..controller..", "..repository..");

    // D: los servicios con implementación separada se consumen por su interfaz.
    @ArchTest
    static final ArchRule impl_classes_are_not_used_directly = noClasses()
            .that().resideOutsideOfPackage("..service.impl..")
            .should().dependOnClassesThat().resideInAPackage("..service.impl..")
            .because("se depende de la interfaz del servicio, no de su implementación");

    // Módulos hoja: couriers y packages usan a los demás, pero nadie depende de ellos.
    // Pendiente de refactor: audit, auth, common y users se referencian entre sí (ciclo); cuando se
    // desacoplen, esta regla puede pasar a slices().matching("com.blawdgourmet.blawdtrack.(*)..").beFreeOfCycles().
    @ArchTest
    static final ArchRule feature_modules_are_leaves = noClasses()
            .that().resideOutsideOfPackages("..couriers..", "..packages..")
            .should().dependOnClassesThat().resideInAnyPackage("..couriers..", "..packages..");

    // Higiene: nada de System.out ni java.util.logging.
    @ArchTest
    static final ArchRule no_standard_streams = NO_CLASSES_SHOULD_ACCESS_STANDARD_STREAMS;

    @ArchTest
    static final ArchRule no_java_util_logging = NO_CLASSES_SHOULD_USE_JAVA_UTIL_LOGGING;

    // POO: las excepciones de la aplicación se llaman como tales.
    @ArchTest
    static final ArchRule exceptions_are_named_exception = classes()
            .that().areAssignableTo(Exception.class)
            .should().haveSimpleNameEndingWith("Exception");
}
