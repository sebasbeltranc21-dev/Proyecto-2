import type { RoomSnapshot } from "@/lib/types";
export function FinalBallots({
  data,
  uid,
}: {
  data: RoomSnapshot;
  uid: string;
}) {
  if (data.game?.stage !== 3) return null;
  const responsible = data.suspects.find(
    (s) => s.id === data.solution?.suspect_id,
  );
  return (
    <section className="final-ballots" aria-label="Votos revelados del equipo">
      <h3>Quién votó por quién</h3>
      <p>
        La votación ha terminado. Culpable oficial:{" "}
        <strong>{responsible?.name ?? "Sin información"}</strong>.
      </p>
      <div className="ballot-table-scroll">
        <table>
          <caption>Votos y resultados de todos los investigadores</caption>
          <thead>
            <tr>
              <th scope="col">Investigador</th>
              <th scope="col">Votó por</th>
              <th scope="col">Resultado</th>
              <th scope="col">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((result) => {
              const suspect = data.suspects.find(
                (s) => s.id === result.suspect_id,
              );
              return (
                <tr key={result.user_id}>
                  <th scope="row">
                    {result.name}
                    {result.user_id === uid ? " (tú)" : ""}
                  </th>
                  <td>
                    {suspect?.name ??
                      (result.suspect_id
                        ? "Sospechoso no disponible"
                        : "No emitió voto")}
                  </td>
                  <td>
                    {result.suspect_id
                      ? result.correct
                        ? "Acertó"
                        : "No acertó"
                      : "Sin voto"}
                  </td>
                  <td>{result.points} pts</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
