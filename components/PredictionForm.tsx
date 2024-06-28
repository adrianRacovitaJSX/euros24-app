"use client";

import React, { useState, useEffect } from "react";
import ShinyButton from "./ui/shiny-button";
import { Input } from "./ui/input";
import Image from "next/image";
import confetti from "canvas-confetti";

type Round = "roundOf16" | "quarterfinals" | "semifinals" | "final";

interface Prediction {
  [key: string]: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number | undefined;
    awayScore: number | undefined;
    homePenalties?: number;
    awayPenalties?: number;
    homeScorers?: { player: string; minute: number }[];
    awayScorers?: { player: string; minute: number }[];
  };
}

const PredictionForm: React.FC = () => {
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const WinnerModal: React.FC<{ winner: string; onClose: () => void }> = ({
    winner,
    onClose,
  }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-zinc-100">
            ¡Campeón de la Euro 2024!
          </h2>
          <Image
            src={flags[winner] || ""}
            alt={teamNamesInSpanish[winner] || winner}
            className="w-32 h-24 mx-auto mb-4 rounded-md"
            width={128}
            height={96}
          />
          <p className="text-xl font-semibold mb-4 text-gray-900 dark:text-zinc-100">
            {teamNamesInSpanish[winner] || winner}
          </p>
          <Image
            src="/logowebuefa.png"
            alt="Trophy"
            className="w-24 h-24 mx-auto mb-4"
            width={96}
            height={96}
          />
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={onClose}
              className="bg-red-500 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block"
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-red-500  opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-red-500  py-0.5 px-4 ring-1 ring-white/10 ">
                <span>Cerrar</span>
                <svg
                  fill="none"
                  height="16"
                  viewBox="0 0 24 24"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.75 8.75L14.25 12L10.75 15.25"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-red-400/0 via-red-400/90 to-red-400/0 transition-opacity duration-500 group-hover:opacity-40" />
            </button>
            <button
              onClick={handleRestart}
              className="bg-blue-500 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block"
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-blue-500  opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-blue-500  py-0.5 px-4 ring-1 ring-white/10 ">
                <span>Reiniciar</span>
                <svg
                  fill="none"
                  height="16"
                  viewBox="0 0 24 24"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.75 8.75L14.25 12L10.75 15.25"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-400/0 via-blue-400/90 to-blue-400/0 transition-opacity duration-500 group-hover:opacity-40" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const teamNamesInSpanish: { [key: string]: string } = {
    Spain: "España",
    Georgia: "Georgia",
    Romania: "Rumanía",
    Netherlands: "Países Bajos",
    Germany: "Alemania",
    Denmark: "Dinamarca",
    Austria: "Austria",
    Turkey: "Turquía",
    Portugal: "Portugal",
    Slovenia: "Eslovenia",
    England: "Inglaterra",
    Slovakia: "Eslovaquia",
    France: "Francia",
    Belgium: "Bélgica",
    Switzerland: "Suiza",
    Italy: "Italia",
  };

  const areAllScoresSet = () => {
    const matchCount =
      currentRound === "roundOf16"
        ? 8
        : currentRound === "quarterfinals"
        ? 4
        : currentRound === "semifinals"
        ? 2
        : 1;

    for (let i = 0; i < matchCount; i++) {
      const match = predictions[i];
      if (
        !match ||
        match.homeScore === undefined ||
        match.awayScore === undefined
      ) {
        return false;
      }
    }
    return true;
  };

  const initialMatches = [
    { homeTeam: "Spain", awayTeam: "Georgia" },
    { homeTeam: "Romania", awayTeam: "Netherlands" },
    { homeTeam: "Germany", awayTeam: "Denmark" },
    { homeTeam: "Austria", awayTeam: "Turkey" },
    { homeTeam: "Portugal", awayTeam: "Slovenia" },
    { homeTeam: "England", awayTeam: "Slovakia" },
    { homeTeam: "France", awayTeam: "Belgium" },
    { homeTeam: "Switzerland", awayTeam: "Italy" },
  ];

  const initializePredictions = () => {
    const initial: Prediction = {};
    initialMatches.forEach((match, index) => {
      initial[index] = {
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: undefined,
        awayScore: undefined,
      };
    });
    return initial;
  };

  const [currentRound, setCurrentRound] = useState<Round>("roundOf16");
  const [predictions, setPredictions] = useState<Prediction>(
    initializePredictions()
  );

  const flags: { [key: string]: string } = {
    Spain: "/spain.webp",
    Georgia: "/georgia.webp",
    Germany: "/germany.svg",
    Denmark: "/denmark.jpg",
    England: "/england.png",
    Slovakia: "/slovakia.png",
    France: "/france.svg",
    Belgium: "/belgium.png",
    Romania: "/romania.svg",
    Netherlands: "/netherlands.svg",
    Switzerland: "/switzerland.png",
    Italy: "/italia.png",
    Austria: "/austria.png",
    Turkey: "/turkey.svg",
    Portugal: "/portugal.webp",
    Slovenia: "/slovenia.svg",
  };

  const generateRealisticScore = (): [number, number] => {
    let homeGoals, awayGoals;
    do {
      const totalGoals = Math.floor(Math.random() * 6); // 0 to 5 total goals
      homeGoals = Math.floor(Math.random() * (totalGoals + 1));
      awayGoals = totalGoals - homeGoals;
    } while (homeGoals === awayGoals);

    return [homeGoals, awayGoals];
  };

  const simulateMatches = () => {
    const matchCount =
      currentRound === "roundOf16"
        ? 8
        : currentRound === "quarterfinals"
        ? 4
        : currentRound === "semifinals"
        ? 2
        : 1;

    const simulatedPredictions = { ...predictions };

    for (let i = 0; i < matchCount; i++) {
      if (simulatedPredictions[i]) {
        let [homeScore, awayScore] = generateRealisticScore();
        let homePenalties: number | undefined;
        let awayPenalties: number | undefined;

        // Small chance (10%) of the match going to penalties
        if (Math.random() < 0.1) {
          // If it goes to penalties, make the scores equal
          awayScore = homeScore;

          // Simulate penalty shootout (5-4 or 4-3 or 6-5, etc.)
          const penaltyWinner = Math.random() < 0.5 ? "home" : "away";
          const penaltyMargin = Math.floor(Math.random() * 2) + 1; // 1 or 2 goal margin
          const loserPenalties = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
          const winnerPenalties = loserPenalties + penaltyMargin;

          if (penaltyWinner === "home") {
            homePenalties = winnerPenalties;
            awayPenalties = loserPenalties;
          } else {
            homePenalties = loserPenalties;
            awayPenalties = winnerPenalties;
          }
        }

        simulatedPredictions[i] = {
          ...simulatedPredictions[i],
          homeScore,
          awayScore,
          homePenalties,
          awayPenalties,
          homeScorers: generateGoalScorers(
            simulatedPredictions[i].homeTeam,
            homeScore
          ),
          awayScorers: generateGoalScorers(
            simulatedPredictions[i].awayTeam,
            awayScore
          ),
        };
      }
    }

    setPredictions(simulatedPredictions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { winners, newPredictions } = getWinners(predictions, currentRound);

    if (currentRound === "final") {
      setWinner(winners[0]);
      setShowWinnerModal(true);
      triggerConfetti();
    } else {
      switch (currentRound) {
        case "roundOf16":
          setCurrentRound("quarterfinals");
          break;
        case "quarterfinals":
          setCurrentRound("semifinals");
          break;
        case "semifinals":
          setCurrentRound("final");
          break;
      }
      setPredictions(newPredictions);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleRestart = () => {
    setCurrentRound("roundOf16");
    setPredictions(initializePredictions());
    setShowWinnerModal(false);
  };

  const getWinners = (
    predictions: Prediction,
    round: Round
  ): { winners: string[]; newPredictions: Prediction } => {
    const winners: string[] = [];
    const newPredictions: Prediction = {};
    const matchCount =
      round === "roundOf16"
        ? 8
        : round === "quarterfinals"
        ? 4
        : round === "semifinals"
        ? 2
        : 1;

    // Determine winners
    for (let i = 0; i < matchCount; i++) {
      const match = predictions[i];
      if (
        match &&
        match.homeScore !== undefined &&
        match.awayScore !== undefined
      ) {
        let winner: string;
        if (
          match.homeScore > match.awayScore ||
          (match.homeScore === match.awayScore &&
            match.homePenalties! > match.awayPenalties!)
        ) {
          winner = match.homeTeam;
        } else {
          winner = match.awayTeam;
        }
        winners.push(winner);
      }
    }

    // Create new pairings based on the round
    if (round === "roundOf16") {
      // Quarterfinals pairings
      newPredictions[0] = {
        homeTeam: winners[0],
        awayTeam: winners[2],
        homeScore: undefined,
        awayScore: undefined,
      };
      newPredictions[1] = {
        homeTeam: winners[1],
        awayTeam: winners[3],
        homeScore: undefined,
        awayScore: undefined,
      };
      newPredictions[2] = {
        homeTeam: winners[4],
        awayTeam: winners[6],
        homeScore: undefined,
        awayScore: undefined,
      };
      newPredictions[3] = {
        homeTeam: winners[5],
        awayTeam: winners[7],
        homeScore: undefined,
        awayScore: undefined,
      };
    } else if (round === "quarterfinals") {
      // Semifinals pairings
      newPredictions[0] = {
        homeTeam: winners[0],
        awayTeam: winners[2],
        homeScore: undefined,
        awayScore: undefined,
      };
      newPredictions[1] = {
        homeTeam: winners[1],
        awayTeam: winners[3],
        homeScore: undefined,
        awayScore: undefined,
      };
    } else if (round === "semifinals") {
      // Final pairing
      newPredictions[0] = {
        homeTeam: winners[0],
        awayTeam: winners[1],
        homeScore: undefined,
        awayScore: undefined,
      };
    }

    return { winners, newPredictions };
  };

  const generateGoalScorers = (teamName: string, numGoals: number) => {
    const players: { [key: string]: string[] } = {
      Spain: [
        "Morata",
        "Ferran Torres",
        "Lamine Yamal",
        "Nico Williams",
        "Carvajal",
      ],
      Georgia: ["Kvaratskhelia", "Zivzivadze", "Kiteishvili", "Lobzhanidze"],
      Romania: ["Puscas", "Ratiu", "Hagi", "Marin", "Stanciu"],
      Netherlands: ["Depay", "Van Dijk", "Gakpo", "Xavi Simons", "Weghorst"],
      Germany: ["Havertz", "Fullkrug", "Musiala", "Gnabry", "Sané"],
      Denmark: ["Højlund", "Wind", "Poulsen", "Eriksen", "Damsgaard"],
      Austria: [
        "Arnautovic",
        "Gregoritsch",
        "Sabitzer",
        "Baumgartner",
        "Kalajdžić",
      ],
      Turkey: ["Yılmaz", "Ünder", "Kahveci", "Çalhanoğlu", "Akgün"],
      Portugal: ["Ronaldo", "Félix", "Ramos", "Leão", "Fernandes"],
      Slovenia: ["Šeško", "Sporar", "Stojanović", "Sesko", "Verbic"],
      England: ["Kane", "Rashford", "Saka", "Sterling", "Grealish"],
      Slovakia: ["Duda", "Mak", "Suslov", "Schranz", "Polievka"],
      France: ["Mbappé", "Giroud", "Griezmann", "Dembélé", "Coman"],
      Belgium: ["Lukaku", "Openda", "Bakayoko", "De Bruyne", "Carrasco"],
      Switzerland: ["Embolo", "Seferović", "Vargas", "Amdouni", "Shaqiri"],
      Italy: ["Immobile", "Retegui", "Raspadori", "Chiesa", "Barella"],
    };

    const scorers: { player: string; minute: number }[] = [];

    for (let i = 0; i < numGoals; i++) {
      const randomIndex = Math.floor(Math.random() * players[teamName].length);
      const randomMinute = Math.floor(Math.random() * 90) + 1;
      scorers.push({
        player: players[teamName][randomIndex],
        minute: randomMinute,
      });
    }

    return scorers;
  };

  const updatePrediction = (
    index: string,
    field: "homeScore" | "awayScore",
    value: number | undefined
  ) => {
    setPredictions((prevPredictions) => {
      const currentPrediction = prevPredictions[index] || {
        homeTeam:
          currentRound === "roundOf16"
            ? initialMatches[parseInt(index)].homeTeam
            : "",
        awayTeam:
          currentRound === "roundOf16"
            ? initialMatches[parseInt(index)].awayTeam
            : "",
        homeScore: undefined,
        awayScore: undefined,
      };

      const updatedPrediction = {
        ...currentPrediction,
        [field]: value,
      };

      if (field === "homeScore" && value !== undefined) {
        updatedPrediction.homeScorers = generateGoalScorers(
          currentPrediction.homeTeam,
          value
        );
      }

      if (field === "awayScore" && value !== undefined) {
        updatedPrediction.awayScorers = generateGoalScorers(
          currentPrediction.awayTeam,
          value
        );
      }

      return {
        ...prevPredictions,
        [index]: updatedPrediction,
      };
    });
  };

  const renderFormFields = () => {
    const matchCount =
      currentRound === "roundOf16"
        ? 8
        : currentRound === "quarterfinals"
        ? 4
        : currentRound === "semifinals"
        ? 2
        : 1;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: matchCount }, (_, index) => {
          const prediction = predictions[index] || {
            homeTeam: "",
            awayTeam: "",
            homeScore: undefined,
            awayScore: undefined,
          };
          return (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-zinc-800 p-4 rounded-lg shadow"
            >
              <div className="flex items-center w-full sm:w-2/5 justify-center sm:justify-start mb-2 sm:mb-0">
                <Image
                  src={flags[prediction.homeTeam] || ""}
                  alt={
                    teamNamesInSpanish[prediction.homeTeam] ||
                    prediction.homeTeam
                  }
                  className="w-8 h-6 sm:w-10 sm:h-8 rounded-md mr-2"
                  width={100}
                  height={6}
                />
                <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-zinc-100">
                  {teamNamesInSpanish[prediction.homeTeam] ||
                    prediction.homeTeam}
                </span>
              </div>
              <div className="flex items-center justify-center w-full sm:w-1/5 mb-2 sm:mb-0">
                <Input
                  type="number"
                  placeholder="Goles"
                  className="w-28 text-center text-black dark:text-white bg-gray-100 dark:bg-zinc-700"
                  value={
                    prediction.homeScore !== undefined
                      ? prediction.homeScore.toString()
                      : ""
                  }
                  onChange={(e) =>
                    updatePrediction(
                      index.toString(),
                      "homeScore",
                      e.target.value === ""
                        ? undefined
                        : parseInt(e.target.value)
                    )
                  }
                />
                <span className="mx-2 text-gray-500 dark:text-zinc-400">-</span>
                <Input
                  type="number"
                  placeholder="Goles"
                  className="w-28 text-center text-black dark:text-white bg-gray-100 dark:bg-zinc-700"
                  value={
                    prediction.awayScore !== undefined
                      ? prediction.awayScore.toString()
                      : ""
                  }
                  onChange={(e) =>
                    updatePrediction(
                      index.toString(),
                      "awayScore",
                      e.target.value === ""
                        ? undefined
                        : parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div className="flex items-center w-full sm:w-2/5 justify-center sm:justify-end">
                <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-zinc-100 mr-2">
                  {teamNamesInSpanish[prediction.awayTeam] ||
                    prediction.awayTeam}
                </span>
                <Image
                  src={flags[prediction.awayTeam] || ""}
                  alt={
                    teamNamesInSpanish[prediction.awayTeam] ||
                    prediction.awayTeam
                  }
                  className="w-8 h-6 sm:w-10 sm:h-8 rounded-md"
                  width={100}
                  height={6}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderResults = () => {
    const matchCount =
      currentRound === "roundOf16"
        ? 8
        : currentRound === "quarterfinals"
        ? 4
        : currentRound === "semifinals"
        ? 2
        : 1;

    return (
      <div className="mt-8 overflow-hidden rounded-lg shadow-lg ">
        <table className="w-full bg-white dark:bg-zinc-900">
          <thead className="bg-gray-50 dark:bg-zinc-800">
            <tr>
              <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Equipo 1
              </th>
              <th className="px-2 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Resultado
              </th>
              <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Equipo 2
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
            {Array.from({ length: matchCount }, (_, index) => {
              const prediction = predictions[index] || {
                homeTeam: "",
                awayTeam: "",
                homeScore: undefined,
                awayScore: undefined,
              };
              return (
                <tr
                  key={index}
                  className={
                    index % 2 === 0
                      ? "bg-white dark:bg-zinc-900"
                      : "bg-gray-50 dark:bg-zinc-800"
                  }
                >
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start">
                      <Image
                        src={flags[prediction.homeTeam] || ""}
                        alt={
                          teamNamesInSpanish[prediction.homeTeam] ||
                          prediction.homeTeam
                        }
                        className="w-8 h-6 rounded-sm sm:mr-3"
                        width={100}
                        height={6}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-zinc-100 hidden sm:block">
                          {teamNamesInSpanish[prediction.homeTeam] ||
                            prediction.homeTeam}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                          {prediction.homeScorers?.map((scorer, idx) => (
                            <div key={idx}>
                              {scorer.player} ({scorer.minute}')
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-center">
                    {prediction.homeScore !== undefined &&
                    prediction.awayScore !== undefined ? (
                      <div>
                        <span className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                          {prediction.homeScore} - {prediction.awayScore}
                        </span>
                        {prediction.homePenalties !== undefined &&
                          prediction.awayPenalties !== undefined && (
                            <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                              Penaltis: {prediction.homePenalties} -{" "}
                              {prediction.awayPenalties}
                            </div>
                          )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-zinc-400">
                        Por jugar
                      </span>
                    )}
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex flex-col items-center sm:flex-row sm:items-end sm:justify-end">
                      <div className="order-2 sm:order-1 sm:text-right sm:mr-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-zinc-100 hidden sm:block">
                          {teamNamesInSpanish[prediction.awayTeam] ||
                            prediction.awayTeam}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                          {prediction.awayScorers?.map((scorer, idx) => (
                            <div key={idx}>
                              {scorer.player} ({scorer.minute}')
                            </div>
                          ))}
                        </div>
                      </div>
                      <Image
                        src={flags[prediction.awayTeam] || ""}
                        alt={
                          teamNamesInSpanish[prediction.awayTeam] ||
                          prediction.awayTeam
                        }
                        className="w-8 h-6 rounded-sm order-1 sm:order-2"
                        width={100}
                        height={6}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const getNextRoundText = () => {
    switch (currentRound) {
      case "roundOf16":
        return "Avanzar a cuartos";
      case "quarterfinals":
        return "Avanzar a semifinales";
      case "semifinals":
        return "Avanzar a la final";
      case "final":
        return "Finalizar torneo";
      default:
        return "Avanzar";
    }
  };

  const getRoundTitle = () => {
    switch (currentRound) {
      case "roundOf16":
        return "Octavos";
      case "quarterfinals":
        return "Cuartos de final";
      case "semifinals":
        return "Semifinales";
      case "final":
        return "Final";
      default:
        return "Euro 2024";
    }
  };

  return (
    <div className="container mx-auto px-6 lg:px-0 md:px-0 xl:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">{getRoundTitle()}</h1>
        <div className="flex gap-5 justify-center sm:hidden w-full">
          <button
            onClick={simulateMatches}
            className="bg-emerald-500 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block flex-1"
          >
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 rounded-full bg-emerald-500  opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </span>
            <div className="relative flex space-x-2 items-center z-10 rounded-full bg-emerald-500  py-0.5 px-4 ring-1 ring-white/10 ">
              <span>Simular</span>
              <svg
                fill="none"
                height="16"
                viewBox="0 0 24 24"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.75 8.75L14.25 12L10.75 15.25"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
          </button>
          <button
            onClick={handleRestart}
            className="bg-red-500 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block flex-1"
          >
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 rounded-full bg-red-500  opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </span>
            <div className="relative flex space-x-2 items-center z-10 rounded-full bg-red-500  py-0.5 px-4 ring-1 ring-white/10 ">
              <span>Reiniciar</span>
              <svg
                fill="none"
                height="16"
                viewBox="0 0 24 24"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.75 8.75L14.25 12L10.75 15.25"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-red-400/0 via-red-400/90 to-red-400/0 transition-opacity duration-500 group-hover:opacity-40" />
          </button>
        </div>
        <div className="hidden sm:flex gap-5 justify-end">
          <button
            onClick={simulateMatches}
            className="bg-emerald-500 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block"
          >
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 rounded-full bg-emerald-500  opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </span>
            <div className="relative flex space-x-2 items-center z-10 rounded-full bg-emerald-500  py-0.5 px-4 ring-1 ring-white/10 ">
              <span>Simular</span>
              <svg
                fill="none"
                height="16"
                viewBox="0 0 24 24"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.75 8.75L14.25 12L10.75 15.25"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
          </button>
          <button
            onClick={handleRestart}
            className="bg-red-500 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block"
          >
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 rounded-full bg-red-500  opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </span>
            <div className="relative flex space-x-2 items-center z-10 rounded-full bg-red-500  py-0.5 px-4 ring-1 ring-white/10 ">
              <span>Reiniciar</span>
              <svg
                fill="none"
                height="16"
                viewBox="0 0 24 24"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.75 8.75L14.25 12L10.75 15.25"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-red-400/0 via-red-400/90 to-red-400/0 transition-opacity duration-500 group-hover:opacity-40" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {renderFormFields()}
        <div className="flex justify-center sm:justify-start">
          <button
            type="submit"
            disabled={!areAllScoresSet()}
            className={`mt-10 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block
      ${
        areAllScoresSet()
          ? "bg-blue-500 hover:bg-blue-600"
          : "bg-gray-400 cursor-not-allowed"
      }`}
          >
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span
                className={`absolute inset-0 rounded-full ${
                  areAllScoresSet()
                    ? "bg-blue-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    : "bg-gray-400"
                }`}
              />
            </span>
            <div
              className={`relative flex space-x-2 items-center z-10 rounded-full py-0.5 px-4 ring-1 ring-white/10 ${
                areAllScoresSet() ? "bg-blue-500" : "bg-gray-400"
              }`}
            >
              <span> {getNextRoundText()} </span>
              <svg
                fill="none"
                height="16"
                viewBox="0 0 24 24"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.75 8.75L14.25 12L10.75 15.25"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <span
              className={`absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r ${
                areAllScoresSet()
                  ? "from-blue-400/0 via-blue-400/90 to-blue-400/0"
                  : "from-gray-400/0 via-gray-400/90 to-gray-400/0"
              } transition-opacity duration-500 group-hover:opacity-40`}
            />
          </button>
        </div>
      </form>
      {renderResults()}
      {showWinnerModal && winner && (
        <WinnerModal
          winner={winner}
          onClose={() => setShowWinnerModal(false)}
        />
      )}
    </div>
  );
};

export default PredictionForm;
