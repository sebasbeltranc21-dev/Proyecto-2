# Matrix Solver

Aplicación web para resolver sistemas de ecuaciones lineales de hasta **5 variables** y **5 ecuaciones**.

## Fase 1
- Matriz aumentada de hasta 5×6.
- Gauss-Jordan y Eliminación de Gauss.
- Clasificación: solución única, infinitas soluciones o sin solución.
- Rangos y procedimiento paso a paso.
- Interfaz responsive y compatible con GitHub Pages.

## Fase 2
- Las soluciones con infinitas posibilidades ahora se muestran **en forma paramétrica**.
- Se identifican automáticamente las variables libres (`t1`, `t2`, etc.).
- Gauss-Jordan muestra la **matriz reducida (RREF)**.
- Gauss muestra la **matriz escalonada** y usa la forma reducida para construir la solución paramétrica.
- Se agregaron pruebas para sistemas con varias variables libres.

## Probar localmente

Puedes abrir `index.html` directamente en el navegador.

Para comprobar el motor matemático:

```bash
node tests/solver.test.js
```

Los tests verifican ambos métodos, soluciones únicas, infinitas, sistemas incompatibles, 5×5 y validación de entradas.
