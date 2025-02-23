import React from "react";
import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { DatosJugadorContext } from "../../../contexts/DatosJugadorContext";
import { DatosPartidaContext } from "../../../contexts/DatosPartidaContext";
import { UsarMovimientoContext } from "../../../contexts/UsarMovimientoContext";
import { ServicioPartida } from "../../../services/ServicioPartida";
import { Alerts } from "../../../components/Alerts";
import { EventoContext } from "../../../contexts/EventoContext";
import { HabilitarAccionesUsuarioContext } from "../../../contexts/HabilitarAccionesUsuarioContext";

export const TerminarTurno = () => {
  const { match_id } = useParams();

  const { datosJugador, setDatosJugador } = useContext(DatosJugadorContext);
  const { datosPartida, setDatosPartida } = useContext(DatosPartidaContext);
  const { usarMovimiento, setUsarMovimiento } = useContext(
    UsarMovimientoContext,
  );
  const { ultimoEvento } = useContext(EventoContext);
  const { setHabilitarAccionesUsuario } = useContext(
    HabilitarAccionesUsuarioContext,
  );

  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [habilitarBoton, setHabilitarBoton] = useState(false);

  const tipoAlerta = "info";

  useEffect(() => {
    if (ultimoEvento !== null) {
      switch (ultimoEvento.key) {
        case "GET_PLAYER_MATCH_INFO":
          if (
            ultimoEvento.payload.turn_order ===
            ultimoEvento.payload.current_turn_order
          ) {
            setHabilitarBoton(true);
          } else {
            setHabilitarBoton(false);
          }
          setMensajeAlerta(
            `Turno de ${ultimoEvento.payload.current_turn_player}.`,
          );
          setMostrarAlerta(true);

          setTimeout(() => {
            setMostrarAlerta(false);
          }, 1500);
          break;

        case "END_PLAYER_TURN":
          setUsarMovimiento({
            cartaHovering: false,
            fichaHovering: false,
            cartaSeleccionada: null,
            fichasSeleccionadas: [],
            cartasCompletadas: 0,
            highlightCarta: { state: false, key: "" },
            cartasUsadas: [],
            movimientosPosibles: [],
          });
          setMensajeAlerta(
            `${ultimoEvento.payload.current_player_name} ha terminado su turno.`,
          );
          setMostrarAlerta(true);
          setTimeout(() => {
            setMostrarAlerta(false);
          }, 1500);

          setDatosPartida({
            ...datosPartida,
            current_player_name: ultimoEvento.payload.next_player_name,
          });

          if (
            ultimoEvento.payload.next_player_turn === datosJugador.player_turn
          ) {
            setHabilitarAccionesUsuario(true);
            setHabilitarBoton(true);
            setDatosJugador({ ...datosJugador, is_player_turn: true });
          } else {
            setHabilitarAccionesUsuario(false);
            setHabilitarBoton(false);
            setDatosJugador({ ...datosJugador, is_player_turn: false });
          }

          setMensajeAlerta(
            `Turno de ${ultimoEvento.payload.next_player_name}.`,
          );
          setMostrarAlerta(true);

          setTimeout(() => {
            setMostrarAlerta(false);
          }, 1500);

          break;

        default:
          break;
      }
    }
  }, [ultimoEvento]);

  const handleTerminarTurno = async () => {
    const respuesta = await ServicioPartida.terminarTurno(
      match_id,
      datosJugador.player_id,
    );
  };

  return (
    <div className="terminar-turno-div absolute top-0 left-0 w-full h-full flex z-10">
      {mostrarAlerta && (
        <div className="fixed top-3 right-3 w-1/3 z-50">
          <Alerts type={tipoAlerta} message={mensajeAlerta} />
        </div>
      )}
      <div className="terminar-turno-boton-div absolute bottom-5 right-5 z-50">
        <button
          className="terminar-turno-boton btn text-nowrap"
          onClick={handleTerminarTurno}
          disabled={!habilitarBoton}
        >
          Terminar turno
        </button>
      </div>
    </div>
  );
};

export default TerminarTurno;
