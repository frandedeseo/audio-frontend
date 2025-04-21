import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// This would come from your API in a real application
const mockUserEvaluation = `{
  "estrategia_silabica": {
    "nivel": "Avanzado",
    "comentario": "El lector no requiere utilizar la estrategia silábica para leer, ya que une las sílabas de forma natural."
  },
  "manejo_ritmo": {
    "nivel": "Logrado",
    "comentario": "El lector entona para abajo en los puntos y comas, lo que indica una buena comprensión del ritmo, aunque podría mejorar la variedad en la entonación."
  },
  "manejo_respiracion": {
    "nivel": "Logrado",
    "comentario": "El lector hace pausas en puntos y comas, mostrando buenas habilidades de manejo de la respiración."
  },
  "precision": {
    "nivel": "Avanzado",
    "comentario": "El lector logra leer el texto sin errores aparentes, demostrando una alta precisión en la lectura."
  },
  "fluidez_lectora": {
    "nivel": "Avanzado",
    "comentario": "La lectura del texto fue fluida, lo que evidencia un nivel avanzado de palabras por minuto."
  }
}`;

const criteriaData = [
  {
    id: "estrategia_silabica",
    name: "Estrategia silábica",
    levels: {
      Inicial: "Aún no logra asociar los sonidos en una sílaba.",
      "En proceso": "Puede asociar consonantes, continuar con vocales y empezar a leer sílabas.",
      Logrado: "Utiliza la estrategia silábica para la lectura.",
      Avanzado: "No necesita utilizar la estrategia silábica.",
    },
  },
  {
    id: "manejo_ritmo",
    name: "Manejo del ritmo",
    levels: {
      Inicial: "Lee en forma silabeante y sin entonar.",
      "En proceso": "Lee en forma monótona pero sin silabear las palabras.",
      Logrado: "Entona para abajo en los puntos y comas.",
      Avanzado: "Lee el texto con un adecuado cambio de entonación.",
    },
  },
  {
    id: "manejo_respiracion",
    name: "Manejo de la respiración",
    levels: {
      Inicial: "No hace pausas en puntos y comas.",
      "En proceso": "Realiza pausas entre palabra y palabra.",
      Logrado: "Hace pausas en puntos y comas.",
      Avanzado: "Hace pausas en puntos, comas y antes de palabras cortas, cuando las oraciones son muy largas.",
    },
  },
  {
    id: "precision",
    name: "Precisión",
    levels: {
      Inicial: "Cambia letras por otras: sustituye, omite o añade letras.",
      "En proceso": "Cambia palabras por otras o adivina en forma incorrecta.",
      Logrado: "Logra leer oraciones cometiendo uno o dos errores aislados, no fonológicos.",
      Avanzado: "Logra leer párrafos o textos sin errores.",
    },
  },
  {
    id: "fluidez_lectora",
    name: "Fluidez Lectora",
    levels: {
      Inicial: "Bajo nivel de palabras por minuto.",
      "En proceso": "Nivel medio-bajo de palabras por minuto.",
      Logrado: "Nivel medio-alto de palabras por minuto.",
      Avanzado: "Alto nivel de palabras por minuto.",
    },
  },
];

const getLevelColor = (level) => {
  switch (level) {
    case "Inicial":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "En proceso":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "Logrado":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Avanzado":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

export default function EvaluationTable() {
  const [userEvaluation, setUserEvaluation] = useState(null);
  const [activeTab, setActiveTab] = useState("table");

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    try {
      const parsedData = JSON.parse(mockUserEvaluation);
      setUserEvaluation(parsedData);
    } catch (error) {
      console.error("Error parsing user evaluation data:", error);
    }
  }, []);

  if (!userEvaluation) {
    return <div className="p-4">Loading assessment data...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Evaluación de Lectura</CardTitle>
          <CardDescription>Criterios de evaluación y resultados del estudiante</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="table">Vista de Tabla</TabsTrigger>
              <TabsTrigger value="cards">Vista de Tarjetas</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="w-full">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-50 text-left">Categoría</th>
                      <th className="border p-2 bg-gray-50 text-left">Inicial</th>
                      <th className="border p-2 bg-gray-50 text-left">En proceso</th>
                      <th className="border p-2 bg-gray-50 text-left">Logrado</th>
                      <th className="border p-2 bg-gray-50 text-left">Avanzado</th>
                      <th className="border p-2 bg-gray-50 text-left">Evaluación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteriaData.map((criteria) => {
                      const categoryId = criteria.id;
                      const evaluation = userEvaluation[categoryId];

                      return (
                        <tr key={criteria.id}>
                          <td className="border p-2 font-medium">{criteria.name}</td>
                          {Object.entries(criteria.levels).map(([level, description]) => {
                            const isCurrentLevel = evaluation.nivel === level;
                            return (
                              <td key={level} className={`border p-2 ${isCurrentLevel ? "bg-gray-100" : ""}`}>
                                <div className="text-sm">{description}</div>
                                {isCurrentLevel && <Badge className={`mt-2 ${getLevelColor(level)}`}>Nivel actual</Badge>}
                              </td>
                            );
                          })}
                          <td className="border p-2">
                            <div className="flex flex-col gap-2">
                              <Badge className={getLevelColor(evaluation.nivel)}>{evaluation.nivel}</Badge>
                              <p className="text-sm text-gray-700">{evaluation.comentario}</p>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="cards">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {criteriaData.map((criteria) => {
                  const categoryId = criteria.id;
                  const evaluation = userEvaluation[categoryId];

                  return (
                    <Card key={criteria.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle>{criteria.name}</CardTitle>
                        <Badge className={`${getLevelColor(evaluation.nivel)} mt-1`}>{evaluation.nivel}</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm">Evaluación:</h4>
                            <p className="text-sm text-gray-700">{evaluation.comentario}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Criterios:</h4>
                            <ul className="text-sm space-y-2 mt-2">
                              {Object.entries(criteria.levels).map(([level, description]) => (
                                <li key={level} className={`p-2 rounded-md ${evaluation.nivel === level ? "bg-gray-100" : ""}`}>
                                  <span className="font-medium">{level}:</span> {description}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
