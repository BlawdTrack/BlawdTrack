/**
 * Hay cambios sin guardar si algún campo del formulario difiere de los valores con que se cargó (o de
 * los valores vacíos de un formulario nuevo). Compara como texto, así "25" y 25 son lo mismo.
 * @param {Record<string, unknown>} formData Valores actuales.
 * @param {Record<string, unknown> | null} initialValues Valores de partida; sin ellos nunca hay cambios.
 * @returns {boolean}
 */
export const isFormDirty = (formData, initialValues) =>
  Boolean(initialValues)
  && Object.keys(initialValues).some((field) => String(formData[field] ?? '') !== String(initialValues[field] ?? ''));
