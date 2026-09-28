# Matrix Solver

Aplicación web para resolver sistemas de ecuaciones lineales de hasta **5 variables** y **5 ecuaciones**.

## Funciones de esta primera versión

- Matriz aumentada de hasta 5×6 (5 variables).
- Resolución por **Gauss-Jordan**.
- Resolución por **Eliminación de Gauss**.
- Detección de solución única, infinitas soluciones o sistema sin solución.
- Visualización de rangos `r(A)` y `r(A|b)`.
- Procedimiento paso a paso.
- Ejemplos integrados para probar los tres casos.
- Interfaz responsive y lista para GitHub Pages.

## Probar localmente

No necesita servidor para funcionar. Puedes abrir `index.html` directamente en el navegador.

Para verificar la lógica matemática:

```bash
node tests/solver.test.js
```

Los tests cubren ambos métodos, sistemas 5×5 y validaciones de entrada.
