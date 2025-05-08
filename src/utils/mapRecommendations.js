// translate your API’s keys to the ones in recommendation.json
const KEY_MAP = {
  estrategia_silabica: "estrategia_silabica",
  manejo_ritmo: "manejo_ritmo",
  manejo_respiracion: "manejo_respiracion",
  precision: "precision",
  fluidez_lectora: "fluidez_lectora",
};

/**
 * evalResp: { [critKey]: { nivel: string, comentario: string } }
 * recommendations: the imported recommendation.json
 * grado: the alumno’s grado (number)
 *
 * Returns:
 * {
 *   [critKey]: {
 *     nivel: string,
 *     comentario: string,
 *     recomendacion: string
 *   }
 * }
 */
export function mapRecommendations(evalResp, recommendations, grado) {
  return Object.entries(evalResp).reduce((acc, [critKey, { nivel, comentario }]) => {
    const recKey = KEY_MAP[critKey];
    const levelBlock = recommendations[recKey] && recommendations[recKey][nivel];
    if (!levelBlock) {
      console.warn(`No recommendation for ${recKey} @ ${nivel}`);
      acc[critKey] = { nivel, comentario, recomendacion: "" };
      return acc;
    }

    // pick positiva vs negativa
    const isPositiva = levelBlock.positiva.grados.includes(grado);
    const recomendacion = isPositiva ? levelBlock.positiva.texto : levelBlock.negativa.texto;

    acc[critKey] = { nivel, comentario, recomendacion };
    return acc;
  }, {});
}
