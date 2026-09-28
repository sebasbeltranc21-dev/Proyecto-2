# Matrix Solver

Aplicación web para resolver sistemas de ecuaciones lineales de hasta **5 variables** y **5 ecuaciones**.

## Fase 1
- Matriz aumentada de hasta 5×6.
- Gauss-Jordan y Eliminación de Gauss.
- Clasificación: solución única, infinitas soluciones o sin solución.
- Rangos y procedimiento paso a paso.
- Interfaz responsive y compatible con GitHub Pages.

## Fase 2
- Soluciones con infinitas posibilidades en forma paramétrica.
- Detección de variables libres.
- Matriz reducida (RREF) para Gauss-Jordan.
- Matriz escalonada para Gauss.

## Fase 3
- **Aritmética exacta con fracciones** mediante `BigInt`.
- Puedes escribir entradas como `1/3`, `-5/2`, `0.125` o notación científica.
- Las operaciones de eliminación se realizan sin redondear a coma flotante.
- Los resultados se muestran como fracciones reducidas.
- Ejemplo adicional para probar sistemas con fracciones.
- Tests ampliados para precisión exacta y entradas inválidas.

## Fase 4
- Presets para cargar rápidamente sistemas de prueba: solución única, fracciones, infinitas, incompatible y 5×5.
- Historial local de hasta 8 sistemas resueltos, con opción de cargar o borrar entradas.
- Indicaciones más claras al abrir el procedimiento matemático.
- El historial usa `localStorage` y no bloquea la app si el navegador no permite almacenamiento.

## Fase 5
- Copiar la solución al portapapeles.
- Descargar un reporte completo en `.txt` con matriz de entrada, resultado, matriz final y procedimiento.
- Imprimir el resultado o usar la opción del navegador **Guardar como PDF**.
- El diseño de impresión oculta controles innecesarios y conserva el resultado y procedimiento.

## Fase 6
- Explicación automática de la clasificación del sistema mediante rangos.
- Explicación breve de cada operación elemental de filas.
- Presentación más didáctica del procedimiento matemático.
- Vista de impresión corregida para incluir correctamente el resultado y los pasos.

## Fase 7
- Conversión de la matriz de entrada a ecuaciones legibles, respetando signos, ceros y fracciones exactas.
- Navegación paso a paso con botones Anterior/Siguiente y contador de progreso.
- La impresión conserva todos los pasos aunque la vista normal muestre uno a la vez.
- El reporte descargable también incluye las ecuaciones originales.

## Fase 8
- Resaltado visual de las filas que participan en cada operación elemental.
- Marcado del pivote usado en cada paso cuando corresponde.
- Identificación de la fila objetivo para las eliminaciones y normalizaciones.
- La información visual se genera desde el solver y no altera los cálculos exactos.

## Verificación

Para ejecutar las pruebas:

```bash
node tests/solver.test.js
```

También hay una acción de GitHub que comprueba sintaxis y tests en cada push a `main`.
