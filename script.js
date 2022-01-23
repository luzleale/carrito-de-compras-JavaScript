//Declaración de variables globales

let carritoDeCompras = [];

let stockProductos = [];

//DOM

const contenedorProductos = document.getElementById(`contenedor-productos`);
const contenedorCarrito = document.getElementById(`carrito-contenedor`);
const contadorCarrito = document.getElementById(`contadorCarrito`);
const precioTotal = document.getElementById(`precioTotal`);
const selectNombre = document.getElementById(`selectNombre`);
let botonFinalizarCompra = document.getElementById(`divFinalizar`);

//Evento del select para filtrar los productos por nombre
selectNombre.addEventListener(`change`, () => {
  if (selectNombre.value == `all`) {
    mostrarProductos(stockProductos);
  } else {
    mostrarProductos(
      stockProductos.filter((elemento) => elemento.nombre == selectNombre.value)
    );
  }
});

//Petición AJAX con get para traer los productos de mi archivo json, cargarlos a mi array y ejecutar la función para mostrarlos
$.getJSON(`datos.json`, function (data) {
  data.forEach((elemento) => stockProductos.push(elemento));
  mostrarProductos(stockProductos);
});

//Función para mostrar mis productos en el DOM
function mostrarProductos(array) {
  contenedorProductos.innerHTML = ``;
  array.forEach((productos) => {
    let div = document.createElement(`div`);
    div.classList.add(`producto`);
    div.innerHTML += `
    <div class="card">
      <div class="card-image">
      <img src=${productos.img}>
      <h3 class="card-title text-uppercase">${productos.nombre}</h3>
    
      </div>
      <div class="card-content">
      <p class="text-capitalize cardPadding">Color: ${productos.color}</p>
      <p class="text-capitalize cardPadding">Marca: ${productos.marca}</p>
      <p class="cardPadding">$${productos.precio}</p>
    </div>
    <button id="boton${productos.id}" type="button" class="btn btnEstilo"><i class="fas fa-cart-plus iconoDeAgregar"></i></button>
    </div>
    `;
    contenedorProductos.appendChild(div);

    let botonAgregar = document.getElementById(`boton${productos.id}`);

    botonAgregar.addEventListener(`click`, () => {
      agregarAlCarrito(productos.id);
      Toastify({
        text: "Producto Agregado al Carrito",
        className: "info",
        style: {
          background: "#f29544",
        },
      }).showToast();
    });
  });
}

//Función para agregar productos al carrito y actualizar la cantidad de cada uno
function agregarAlCarrito(id) {
  let productosElegidos = carritoDeCompras.find(
    (elemento) => elemento.id == id
  );
  if (productosElegidos) {
    productosElegidos.cantidad = productosElegidos.cantidad + 1;
    document.getElementById(
      `cantidad${productosElegidos.id}`
    ).innerHTML = `<p id="cantidad${productosElegidos.id}">Cantidad: ${productosElegidos.cantidad}</p>`;
    actualizarCarrito();
    localStorage.setItem(`carrito`, JSON.stringify(carritoDeCompras));
  } else {
    let agregarProducto = stockProductos.find((producto) => producto.id == id);
    carritoDeCompras.push(agregarProducto);

    if (carritoDeCompras.length > 0) {
      $(`#btnFin`).show();
    }

    mostrarCarrito(agregarProducto);
    actualizarCarrito();
  }
  localStorage.setItem(`carrito`, JSON.stringify(carritoDeCompras));
}

//Función para mostrar los productos que hay en el carrito y eliminarlos, actualizando la cantidad
function mostrarCarrito(agregarProducto) {
  let div = document.createElement(`div`);
  div.classList.add(`productoEnCarrito`);
  div.innerHTML = `
                    <h3>${agregarProducto.nombre}</h3>
                    <p>$${agregarProducto.precio}</p>
                    <p id="cantidad${agregarProducto.id}">Cantidad: ${agregarProducto.cantidad}</p>
                    <button class="boton-eliminar" id="eliminar${agregarProducto.id}"><i class="fas fa-trash-alt"></i></button>
  `;
  contenedorCarrito.appendChild(div);

  let eliminarProducto = document.getElementById(
    `eliminar${agregarProducto.id}`
  );

  eliminarProducto.addEventListener(`click`, () => {
    if (agregarProducto.cantidad == 1) {
      eliminarProducto.parentElement.remove();
      carritoDeCompras = carritoDeCompras.filter(
        (elemento) => elemento.id != agregarProducto.id
      );
      actualizarCarrito();
      localStorage.setItem(`carrito`, JSON.stringify(carritoDeCompras));
    } else {
      agregarProducto.cantidad = agregarProducto.cantidad - 1;
      document.getElementById(
        `cantidad${agregarProducto.id}`
      ).innerHTML = `<p id="cantidad${agregarProducto.id}">Cantidad: ${agregarProducto.cantidad}</p>`;
      actualizarCarrito();
      localStorage.setItem(`carrito`, JSON.stringify(carritoDeCompras));
    }
  });
}

//Función para traer los datos almacenados en el Local Storage
function recuperarDatos() {
  let recuperarDatos = JSON.parse(localStorage.getItem(`carrito`));
  if (recuperarDatos) {
    recuperarDatos.forEach((elemento) => {
      mostrarCarrito(elemento);
      carritoDeCompras.push(elemento);
      actualizarCarrito();
    });
  }
}

recuperarDatos();

botonFinalizarCompra.innerHTML = `<button id="btnFin" class="btn btn-success btn-lg">Finalizar compra</button>`;
if (carritoDeCompras.length == 0) {
  $(`#btnFin`).hide();
}

//Acumulador del carrito
function actualizarCarrito() {
  contadorCarrito.innerText = carritoDeCompras.reduce(
    (acumulador, elemento) => acumulador + elemento.cantidad,
    0
  );
  precioTotal.innerText = carritoDeCompras.reduce(
    (acumulador, elemento) => acumulador + elemento.precio * elemento.cantidad,
    0
  );
}

//Evento del botón del carrito para simular la finalización de la compra

$(`#btnFin`).on(`click`, () => {
  $.post(
    "https://jsonplaceholder.typicode.com/posts",
    JSON.stringify(carritoDeCompras),
    function (data, estado) {
      if (estado) {
        $(`#carrito-contenedor`).empty();
        $(`#carrito-contenedor`).append(
          `<p id="compraRealizada">Su compra fue realizada con éxito</p>`
        );
        $(`#compraRealizada`)
          .animate({
            "font-size": "1.8rem",
          })
          .fadeOut(7000);

        carritoDeCompras = [];
        localStorage.clear();

        Toastify({
          text: "Muchas gracias por su compra",
          className: "info",
          style: {
            background: "green",
          },
        }).showToast();

        $(`#btnFin`).hide();
        actualizarCarrito();
      }
    }
  );
});
