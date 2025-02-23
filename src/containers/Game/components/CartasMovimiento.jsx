import React from "react";
import { useEffect, useContext, useState } from "react";
import { DatosJugadorContext } from "../../../contexts/DatosJugadorContext";
import { UsarMovimientoContext } from "../../../contexts/UsarMovimientoContext";
import { EventoContext } from "../../../contexts/EventoContext";
import { ServicioMovimiento } from "../../../services/ServicioMovimiento.js";
import { CompletarFiguraContext } from "../../../contexts/CompletarFiguraContext.jsx";
import mov1 from "../../../assets/Movimientos/mov1.svg";
import mov2 from "../../../assets/Movimientos/mov2.svg";
import mov3 from "../../../assets/Movimientos/mov3.svg";
import mov4 from "../../../assets/Movimientos/mov4.svg";
import mov5 from "../../../assets/Movimientos/mov5.svg";
import mov6 from "../../../assets/Movimientos/mov6.svg";
import mov7 from "../../../assets/Movimientos/mov7.svg";
import "./CartasMovimiento.css";
import { HabilitarAccionesUsuarioContext } from "../../../contexts/HabilitarAccionesUsuarioContext.jsx";

const urlMap = {
  Diagonal: mov1,
  "Inverse Diagonal": mov4,
  Line: mov3,
  "Line Between": mov2,
  "Line Border": mov7,
  L: mov6,
  "Inverse L": mov5,
};

export const CartasMovimiento = () => {
  const [cartasMovimiento, setCartasMovimiento] = useState([]);

  const { datosJugador, setDatosJugador } = useContext(DatosJugadorContext);
  const { usarMovimiento, setUsarMovimiento } = useContext(
    UsarMovimientoContext,
  );
  const { cartaSeleccionada: cartaFiguraSeleccionada } = useContext(
    CompletarFiguraContext,
  );
  const { ultimoEvento } = useContext(EventoContext);
  const { habilitarAccionesUsuario } = useContext(
    HabilitarAccionesUsuarioContext,
  );

  useEffect(() => {
    if (ultimoEvento !== null) {
      if (ultimoEvento.key == "GET_MOVEMENT_CARD") {
        const cartasNoUsadas = cartasMovimiento.filter(
          (carta) =>
            !usarMovimiento.cartasUsadas.some((usada) => usada[0] === carta[0]),
        );

        const nuevasCartas = ultimoEvento.payload.movement_card;

        setCartasMovimiento([...cartasNoUsadas, ...nuevasCartas]);
      } else if (ultimoEvento.key === "GET_PLAYER_MATCH_INFO") {
        setUsarMovimiento((prev) => ({
          ...prev,
          cartasUsadas: ultimoEvento.payload.last_movements,
        }));
      }
    }
  }, [ultimoEvento]);

  const handleCartaClick = ({ carta, index }) => {
    if (cartaFiguraSeleccionada !== null) {
      return;
    }

    if (datosJugador.is_player_turn && habilitarAccionesUsuario) {
      if (!usarMovimiento.cartasUsadas.includes(carta[1])) {
        const isCartaHighlighted =
          usarMovimiento.highlightCarta.state &&
          usarMovimiento.highlightCarta.key === index;

        if (isCartaHighlighted) {
          setUsarMovimiento({
            ...usarMovimiento,
            cartaSeleccionada: null,
            fichasSeleccionadas: [],
            highlightCarta: { state: false, key: null },
          });
        } else if (
          usarMovimiento.highlightCarta.state &&
          usarMovimiento.highlightCarta.key !== index
        ) {
          // Actualiza el estado de cartaSeleccionada y recalcula movimientos posibles
          setUsarMovimiento((prev) => {
            const movimientosCalculados =
              ServicioMovimiento.calcularMovimientos(
                prev.fichasSeleccionadas.length
                  ? prev.fichasSeleccionadas[0].rowIndex
                  : null,
                prev.fichasSeleccionadas.length
                  ? prev.fichasSeleccionadas[0].columnIndex
                  : null,
                carta[1],
              );

            return {
              ...prev,
              cartaSeleccionada: carta,
              highlightCarta: { state: true, key: index },
              movimientosPosibles: movimientosCalculados,
            };
          });
          console.log("Carta seleccionada: ", carta[1]);
        } else {
          setUsarMovimiento({
            ...usarMovimiento,
            cartaSeleccionada: carta,
            highlightCarta: { state: true, key: index },
          });
          console.log("Carta seleccionada: ", carta[1]);
        }
      }
    }
  };

  return (
    <div>
      <div className="cartas-movimientos-propias">
        {cartasMovimiento.map((carta, index) => {
          const estaUsada = usarMovimiento.cartasUsadas.some(
            (cartaUsada) => carta[0] === cartaUsada[0],
          );

          return (
            <div
              key={index}
              onMouseEnter={() =>
                setUsarMovimiento({ ...usarMovimiento, cartaHovering: true })
              }
              onMouseLeave={() =>
                setUsarMovimiento({ ...usarMovimiento, cartaHovering: false })
              }
              className={`carta-movimiento 
              ${usarMovimiento.cartaHovering && !usarMovimiento.highlightCarta.state ? "hover:cursor-pointer hover:shadow-[0px_0px_15px_rgba(224,138,44,1)] hover:scale-105" : ""} 
              ${usarMovimiento.highlightCarta.state && usarMovimiento.highlightCarta.key === index && !estaUsada ? "cursor-pointer shadow-[0px_0px_20px_rgba(100,200,44,1)] scale-105" : ""}
              ${usarMovimiento.highlightCarta.state && usarMovimiento.highlightCarta.key !== index && !estaUsada ? "opacity-75 hover:cursor-pointer hover:shadow-[0px_0px_15px_rgba(224,138,44,1)]" : ""}
              ${cartaFiguraSeleccionada !== null || estaUsada ? "opacity-25 pointer-events-none greyscale" : ""}`}
              onClick={() => handleCartaClick({ carta, index })}
            >
              <img className="carta" src={urlMap[carta[1]]} alt={carta[1]} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartasMovimiento;
