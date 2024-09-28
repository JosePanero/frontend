import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { set, useForm } from "react-hook-form";
import { Alerts } from "../../../components/Alerts.jsx";
import "./CrearPartida.css";

export const CrearPartida = () => {
  const navegar = useNavigate();
  const [showSuccess, setShowSuccess] = useState(null);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      nombreJugador: "",
      nombreSala: "",
      cantidadJugadores: "",
    },
  });

  const nombreJugadorWatch = watch("nombreJugador");
  const nombreSalaWatch = watch("nombreSala");
  const cantidadJugadoresWatch = watch("cantidadJugadores");

  const onSubmit = async (e) => {
    try {
      let res = await fetch("/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombreJugador: nombreJugadorWatch,
          nombreSala: nombreSalaWatch,
          cantidadJugadores: cantidadJugadoresWatch,
        }),
      });
      let resJson = await res.json();
      if (res.ok) {
        setMessage("Sala de partida creada con exito");
        setShowSuccess("success");
        console.log(resJson);
        reset();

        setTimeout(() => {
          navegar("/lobby");
        }, 300);
      }
    } catch (err) {
      setMessage("Error creando sala de partida");
      setShowSuccess("error");
      console.log(err);
    }
  };

  // handle closure of modal
  const handleClose = (e) => {
    reset();
    document.getElementById("my_modal_1").close();
  };

  return (
    <>
      <div className="CrearPartida w-full">
        <button
          className="boton-crear-partida btn mb-1"
          onClick={() => document.getElementById("my_modal_1").showModal()}
        >
          Crear sala
        </button>
      </div>
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          {showSuccess ? <Alerts type={showSuccess} message={message} /> : null}
          <h3 className="font-bold text-lg">Crea tu propia sala de partida!</h3>
          <div className="modal-action">
            <form
              id="crear_partida_form"
              className="crear-partida-form w-full"
              method="dialog"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* if there is a button in form, it will close the modal */}
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={handleClose}
              >
                ✕
              </button>
              <label className="label-modal-crear-partida form-control w-full items-center">
                <input
                  type="text"
                  aria-label="nombreJugador"
                  placeholder="Elige tu nombre de jugador"
                  value={nombreJugadorWatch}
                  className="input-modal-crear-partida input input-bordered w-full text-left"
                  {...register("nombreJugador", {
                    required: {
                      value: true,
                      message: "Este campo es requerido",
                    },
                    maxLength: {
                      value: 50,
                      message:
                        "El nombre de jugador debe ser menor a 50 caracteres",
                    },
                  })}
                />
                <span className="error">{errors.nombreJugador?.message}</span>
                <input
                  type="text"
                  aria-label="nombreSala"
                  placeholder="Elige el nombre de tu sala de partida"
                  value={nombreSalaWatch}
                  className="input-modal-crear-partida input input-bordered w-full"
                  {...register("nombreSala", {
                    required: {
                      value: true,
                      message: "Este campo es requerido",
                    },
                    maxLength: {
                      value: 50,
                      message:
                        "El nombre de la sala debe ser menor a 50 caracteres",
                    },
                  })}
                />
                <span className="error">{errors.nombreSala?.message}</span>
                <input
                  type="text"
                  aria-label="cantidadJugadores"
                  placeholder="Elige la cantidad maxima de jugadores (2-4)"
                  value={cantidadJugadoresWatch}
                  className="input-modal-crear-partida input input-bordered w-full"
                  {...register("cantidadJugadores", {
                    required: {
                      value: true,
                      message: "Este campo es requerido",
                    },
                    min: {
                      value: 2,
                      message: "La sala debe tener un minimo de 2 jugadores",
                    },
                    max: {
                      value: 4,
                      message: "La sala debe tener un maximo de 4 jugadores",
                    },
                  })}
                />
                <span className="error">
                  {errors.cantidadJugadores?.message}
                </span>
              </label>
              <div className="formButtons">
                <input
                  className="submit-crear-partida input btn btn-active "
                  type="submit"
                  value="Crear sala de partida"
                />
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default CrearPartida;
