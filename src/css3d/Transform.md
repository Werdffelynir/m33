
# transform: matrix
```
         skewX
      skewY  |     translate(x, y)
          |  |     |  |
matrix(1, 0, 0, 1, 0, 0);
       |        |
  scaleX   scaleY
       a, b, c, d, e, f
       
```

# Keyword values
transform: none;

transform:
translate(x, y)
rotate(angle)
scale(sx, sy)
skew(ax, ay)
matrix(a, b, c, d, e, f)

# Function values
transform: matrix(1, 2, 3, 4, 5, 6);
transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
transform: perspective(17px);
transform: rotate(0.5turn);
transform: rotate3d(1, 2, 3, 10deg);
transform: rotateX(10deg);
transform: rotateY(10deg);
transform: rotateZ(10deg);
transform: translate(12px, 50%);
transform: translate3d(12px, 50%, 3em);
transform: translateX(2em);
transform: translateY(3in);
transform: translateZ(2px);
transform: scale(2, 0.5);
transform: scale3d(2.5, 1.2, 0.3);
transform: scaleX(2);
transform: scaleY(0.5);
transform: scaleZ(0.3);
transform: skew(30deg, 20deg);
transform: skewX(30deg);
transform: skewY(1.07rad);

# Multiple function values
transform: translateX(10px) rotate(10deg) translateY(5px);
transform: perspective(500px) translate3d(10px, 0, 20px) rotateY(30deg);

# Global values
transform: inherit;
transform: initial;
transform: revert;
transform: revert-layer;
transform: unset;
