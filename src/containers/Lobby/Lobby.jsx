import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { AbandonarPartida } from "../../components/AbandonarPartida";
import { Modal } from "../../components/Modal.jsx";
import useWebSocket from "react-use-websocket";
import { WEBSOCKET_URL } from "../../variablesConfiguracion";
import Alerts from "../../components/Alerts";
import { useParams } from "react-router-dom";
import { DatosJugadorContext } from "../../contexts/DatosJugadorContext";
import { DatosPartidaContext } from "../../contexts/DatosPartidaContext";
import "./Lobby.css";
import IniciarPartida from "./components/IniciarPartida";
import { useNavigate } from "react-router-dom";
import { EventoProvider, EventoContext } from "../../contexts/EventoContext";
import { set } from "react-hook-form";

export function Lobby() {
  const { match_id, player_id } = useParams();
  const navigate = useNavigate();
  const websocket_url = `${WEBSOCKET_URL}/matches/${match_id}/ws/${player_id}`;
  const { lastJsonMessage } = useWebSocket(websocket_url, {
    share: true,
    onClose: () => console.log("Websocket - Lobby: conexión cerrada."),
    onError: (event) => console.error("Websocket - Lobby: error: ", event),
    onOpen: () => console.log("Websocket - Lobby: conexión abierta."),
  });
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [tipoAlerta, setTipoAlerta] = useState("info");
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [estaShaking, setEstaShaking] = useState(false);
  const [cantPlayersLobby, setCantPlayersLobby] = useState(1);
  const [abandonaOwner, setAbandonaOwner] = useState(false);
  const [mensajeCancelacion, setMensajeCancelacion] = useState("");

  const { datosJugador, setDatosJugador } = useContext(DatosJugadorContext);
  const { datosPartida, setDatosPartida } = useContext(DatosPartidaContext);
  const { ultimoEvento, setUltimoEvento } = useContext(EventoContext);

  useEffect(() => {
    return () => {
      setUltimoEvento(null);
      setCantPlayersLobby(1);
    };
  }, []);

  useEffect(() => {
    setUltimoEvento(lastJsonMessage);
  }, [lastJsonMessage]);

  useEffect(() => {
    if (ultimoEvento !== null) {
      switch (ultimoEvento.key) {
        case "PLAYER_JOIN":
          setCantPlayersLobby(cantPlayersLobby + 1);
          setMostrarAlerta(true);
          setTipoAlerta("info");
          setMensajeAlerta(`jugador ${ultimoEvento.payload.name} se ha unido.`);
          setEstaShaking(true);
          setTimeout(() => {
            setEstaShaking(false), setMostrarAlerta(false);
          }, 3000);
          break;

        case "PLAYER_LEFT":
          if (ultimoEvento.payload.is_owner) {
            setAbandonaOwner(true);
            setMostrarAlerta(false);
            setMensajeCancelacion(
              `El dueño de la sala ha cancelado la partida.`,
            );
          } else {
            setCantPlayersLobby(cantPlayersLobby - 1);
            setMostrarAlerta(true);
            setTipoAlerta("info");
            setMensajeAlerta(
              `jugador ${ultimoEvento.payload.name} ha abandonado.`,
            );
            setEstaShaking(true);
            setTimeout(() => {
              setEstaShaking(false), setMostrarAlerta(false);
            }, 3000);
          }
          break;

        case "START_MATCH":
          navigate(`/matches/${match_id}/player/${player_id}`);
          break;

        default:
          break;
      }
    }
  }, [ultimoEvento]);

  const moverJugadorAlHome = () => {
    setAbandonaOwner(false);
    navigate("/");
  };

  return (
    <div>
      <div className={`${estaShaking ? "animate-shake" : ""}`}>
        {mostrarAlerta && <Alerts type={tipoAlerta} message={mensajeAlerta} />}
      </div>
      <AbandonarPartida
        estadoPartida="WAITING"
        idJugador={player_id}
        idPartida={match_id}
      />
      <IniciarPartida
        idPartida={match_id}
        idJugador={player_id}
        esAnfitrion={datosJugador.is_owner}
        nJugadoresEnLobby={cantPlayersLobby}
        maxJugadores={datosPartida.max_players}
      />
      <Modal
        mostrar={abandonaOwner}
        texto={mensajeCancelacion}
        funcionDeClick={moverJugadorAlHome}
        boton="Volver al home"
      />
    </div>
  );
}

export default Lobby;
