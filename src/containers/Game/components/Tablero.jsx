import React from 'react'
import { useEffect, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Ficha } from './Ficha.jsx';
import { Alerts } from "../../../components/Alerts";
import "./Tablero.css";
import { UsarMovimientoContext } from '../../../contexts/UsarMovimientoContext.jsx';
import { ServicioPartida } from "../../../services/ServicioPartida.js";
import { calcularMovimientos } from "../../../services/calcularMovimientos.js";

export const Tablero = ({ initialTiles }) => {
  const { match_id } = useParams();
  const { usarMovimiento, setUsarMovimiento } = useContext(UsarMovimientoContext);
  const [movimientos, setMovimientos] = useState([]);

  const [tiles, setTiles] = useState(initialTiles);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState("");

  const handleFichaClick = async (rowIndex, columnIndex) => {
    if (usarMovimiento.cartaSeleccionada !== null) {
      const fichaEstaSeleccionada = usarMovimiento.fichasSeleccionadas.some(ficha => ficha.rowIndex === rowIndex && ficha.columnIndex === columnIndex);
  
      if (fichaEstaSeleccionada) {
        // Deseleccionar la ficha si ya estaba seleccionada
        const newFichasSeleccionadas = usarMovimiento.fichasSeleccionadas.filter(ficha => ficha.rowIndex !== rowIndex || ficha.columnIndex !== columnIndex);
        setUsarMovimiento(prev => ({ ...prev, fichasSeleccionadas: newFichasSeleccionadas }));
      } 
      else if (usarMovimiento.fichasSeleccionadas.length === 0) {
        // Seleccionar la primera ficha y calcular los movimientos posibles
        setUsarMovimiento(prev => {
          const newFichasSeleccionadas = [...prev.fichasSeleccionadas, { rowIndex, columnIndex }];
          return { ...prev, fichasSeleccionadas: newFichasSeleccionadas };
        });
  
        // Calcular movimientos inmediatamente después de seleccionar la primera ficha
        const movimientosCalculados = calcularMovimientos(rowIndex, columnIndex, usarMovimiento.cartaSeleccionada);
        setMovimientos(movimientosCalculados);
        
      } else if (usarMovimiento.fichasSeleccionadas.length === 1) {
        // Seleccionar la segunda ficha
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
      // llamarServicio(usarMovimiento.fichasSeleccionadas);
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
        swapFichas(newFichasSeleccionadas);
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

  const swapFichas = (fichasSeleccionadas) => {

    if (fichasSeleccionadas.length === 2) {
      const [ficha1, ficha2] = fichasSeleccionadas;

      const { rowIndex: filaFicha1, columnIndex: columnaFicha1 } = ficha1;
      const { rowIndex: filaFicha2, columnIndex: columnaFicha2 } = ficha2;

      const newTiles = tiles.map(row => [...row]);

      const temp = newTiles[filaFicha1][columnaFicha1];
      newTiles[filaFicha1][columnaFicha1] = newTiles[filaFicha2][columnaFicha2];
      newTiles[filaFicha2][columnaFicha2] = temp;

      setTiles(newTiles);

      setUsarMovimiento(prev => ({
        ...prev,
        fichasSeleccionadas: [],
        cartaSeleccionada: null,
      }));
    }
  };

  const estaHighlighted = (rowIndex, columnIndex) => {
    return usarMovimiento.fichasSeleccionadas.some(ficha => ficha.rowIndex === rowIndex && ficha.columnIndex === columnIndex);
  };

  const esMovimientoPosible = (rowIndex, columnIndex) => {
    return movimientos.some(movimiento => movimiento[0] === rowIndex && movimiento[1] === columnIndex);
  };

  const gridCell = tiles.map((row, rowIndex) => {
    return row.map((tileColor, columnIndex) => {
      const highlighted = estaHighlighted(rowIndex, columnIndex);
      const movimientoPosible = esMovimientoPosible(rowIndex, columnIndex);
      const deshabilitado = !highlighted && !movimientoPosible;
      return (
        <Ficha 
          id={`ficha-${rowIndex}-${columnIndex}`}
          key={`${rowIndex}-${columnIndex}`}
          color={tileColor} 
          onClick={() => handleFichaClick(rowIndex, columnIndex)}
          highlightClass={highlighted}
          movimientoPosible={movimientoPosible}
          disabled={deshabilitado}
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