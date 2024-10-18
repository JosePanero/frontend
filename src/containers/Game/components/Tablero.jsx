import React from 'react'
import { useEffect, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Ficha } from './Ficha.jsx';
import { Alerts } from "../../../components/Alerts";
import "./Tablero.css";
import { UsarMovimientoContext } from '../../../contexts/UsarMovimientoContext.jsx';
import { ServicioPartida } from "../../../services/ServicioPartida.js";

export const Tablero = ({ tiles , initialFigures }) => {
  const { match_id } = useParams();
  const { usarMovimiento, setUsarMovimiento } = useContext(UsarMovimientoContext);

  const [tiles, setTiles] = useState(initialTiles);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState("");

  const estaFiguraInicial = (rowIndex, columnIndex) => {
    return initialFigures.some(figure =>
      figure.some(([figRow, figCol]) => figRow === rowIndex && figCol === columnIndex)
    );
  };

  const handleFichaClick = async (rowIndex, columnIndex) => {
    if (usarMovimiento.cartaSeleccionada !== null) {
      const fichaEstaSeleccionada = usarMovimiento.fichasSeleccionadas.some(ficha => ficha.rowIndex === rowIndex && ficha.columnIndex === columnIndex);
  
      if (fichaEstaSeleccionada) {
        // Deseleccionar la ficha si ya estaba seleccionada
        const newFichasSeleccionadas = usarMovimiento.fichasSeleccionadas.filter(ficha => ficha.rowIndex !== rowIndex || ficha.columnIndex !== columnIndex);
        setUsarMovimiento(prev => ({ ...prev, fichasSeleccionadas: newFichasSeleccionadas }));
      } 
      else if (usarMovimiento.fichasSeleccionadas.length < 2) {
        // Agregar la ficha seleccionada si el array tiene menos de 2 fichas
        setUsarMovimiento(prev => {
          const newFichasSeleccionadas = [...prev.fichasSeleccionadas, { rowIndex, columnIndex }];
          return { ...prev, fichasSeleccionadas: newFichasSeleccionadas };
        });
      }
    } else {
      setUsarMovimiento({ ...usarMovimiento, fichasSeleccionadas: [] });
    }
  };

  useEffect(() => {
    console.log('Fichas seleccionadas:', usarMovimiento.fichasSeleccionadas);
    if (usarMovimiento.fichasSeleccionadas.length === 2) {
      // Ejecutar swapFichas y limpiar fichas seleccionadas
      llamarServicio(usarMovimiento.fichasSeleccionadas);
      // Actualizar el estado inmediatamente después de llamar a swapFichas
      setTimeout(() => {
        setUsarMovimiento({
          ...usarMovimiento,
          fichasSeleccionadas: [],
          cartaSeleccionada: null,
          cartasUsadas: [...usarMovimiento.cartasUsadas, usarMovimiento.cartaSeleccionada],
          highlightCarta: { state: false, key: '' },
        });
      }, 700);
    }
  }, [usarMovimiento.fichasSeleccionadas]);

  const llamarServicio = async (newFichasSeleccionadas) => {
    try {
      const resJson = await ServicioPartida.validarMovimiento(
        match_id,
        newFichasSeleccionadas,
        usarMovimiento.cartaSeleccionada
      );
      console.log(resJson);
      if (resJson.isValid) {
        // Realizar animacion de swap.
        swapFichas(newFichasSeleccionadas);
        // Actualizar selecciones
        setTimeout(() => {
          setUsarMovimiento({
            ...usarMovimiento,
            fichasSeleccionadas: [],
            cartaSeleccionada: null,
            cartasUsadas: [...usarMovimiento.cartasUsadas, usarMovimiento.cartaSeleccionada],
            highlightCarta: { state: false, key: '' },
          });
        }, 700);
      } else {
        setMensajeAlerta('Movimiento invalido');
        setMostrarAlerta(true);
        setUsarMovimiento({
          ...usarMovimiento,
          fichasSeleccionadas: [],
        });
        setTimeout(() => {
          setMostrarAlerta(false);
        },1000);
        console.log('Movimiento invalido');
      }
    } catch (err) {
      setMensajeAlerta("Error al validar movimiento");
      console.log(err);
    }
  }

  const estaHighlighted = (rowIndex, columnIndex) => {
    return usarMovimiento.fichasSeleccionadas.some(ficha => ficha.rowIndex === rowIndex && ficha.columnIndex === columnIndex);
  };

  const gridCell = tiles.map((row, rowIndex) => {
    return row.map((tileColor, columnIndex) => {
      const isHighlighted = estaHighlighted(rowIndex, columnIndex); // Seleccionadas por el usuario
      const isFiguraInicial = estaFiguraInicial(rowIndex, columnIndex); // Para las figuras iniciales
  
      return (
        <Ficha 
          id={`ficha-${rowIndex}-${columnIndex}`}
          key={`${rowIndex}-${columnIndex}`}
          color={tileColor} 
          onClick={() => handleFichaClick(rowIndex, columnIndex)}
          highlightClass={isHighlighted} // Fichas seleccionadas
          highlightFiguraInicial={isFiguraInicial} // Fichas de figuras iniciales con brillo blanco
        />
      );
    });
  });

  return (
    <div className="tablero flex w-100 h-screen justify-center items-center">
      {mostrarAlerta && <Alerts type={'error'} message={mensajeAlerta} />}
      <div className="tablero-grid grid grid-cols-6 gap-1">
        {gridCell}
      </div>
    </div>
  );
};

export default Tablero;
