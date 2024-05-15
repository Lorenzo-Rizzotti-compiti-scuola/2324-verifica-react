import {FormEvent, useState} from 'react'
import './App.css'
import {Button} from "@/components/ui/button.tsx";
import {default as defaultAxios} from "axios";
import {Loader2} from "lucide-react"
import {Input} from "@/components/ui/input.tsx";
import {toast} from "sonner";
import {
    AlertDialog, AlertDialogAction,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";

interface StartGameResponse {
    id: string;
    numero: number;
    tentativi: number;
}

interface GuessResponse {
    id: string;
    risultato: Risultato;
    tentativi: number;
}

enum Risultato {
    ToLow = -1,
    Correct = 0,
    ToHigh = 1
}

function App() {
    const axios = defaultAxios.create({
        baseURL: "http://localhost:8080"
    });

    const [gameId, setGameId] = useState<string | null>(null);
    const [name, setName] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userGuess, setUserGuess] = useState<number | undefined>(undefined);
    const [showedResult, setShowedResult] = useState<Risultato | null>(null);
    const [tentativi, setTentativi] = useState<number>(0);

    function getRisultatoText(risultato: Risultato): string {
        switch (risultato) {
            case Risultato.ToLow:
                return "Troppo basso"
                break;
            case Risultato.Correct:
                return `Hai indovinato in ${tentativi} tentativi!`
                break;
            case Risultato.ToHigh:
                return "Numero troppo alto"
                break;
        }
    }

    async function startGame(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        const startGameRequest = await axios.post<StartGameResponse>("/partita", {
            nome: name
        }).catch(() => {
            toast.error("C'è stato un errore durante l'avvio del gioco")
        });

        if (!startGameRequest) {
            setIsLoading(false);
            return;
        }

        setGameId(startGameRequest.data.id);
        setTentativi(startGameRequest.data.tentativi);

        setIsLoading(false);
    }

    async function submitNumber(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsLoading(true);

        const guessRequest = await axios.put<GuessResponse>(`/partita/${gameId}`, {
            numero: userGuess
        }).catch(() => {
            toast.error("C'è stato un errore durante l'invio del indovinamentazionamento");
        });

        if (!guessRequest) {
            setIsLoading(false);
            return;
        }

        setShowedResult(guessRequest.data.risultato);
        setTentativi(guessRequest.data.tentativi);
        if (guessRequest.data.risultato == Risultato.Correct) {
            setGameId(null);
        }

        setIsLoading(false);
    }

    return (
        <>
            {
                !gameId ?
                    <form onSubmit={startGame} className="flex max-w-sm items-center space-x-2">
                        <Input required disabled={isLoading} placeholder="Nome" onChange={(event)=>{setName(event.target.value)}}/>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Avvia partita
                        </Button>
                    </form>:
                    <form onSubmit={submitNumber} className="flex max-w-sm items-center space-x-2">
                        <Input required disabled={isLoading} type="number" min={0} max={100} placeholder="Numero"
                               onChange={(event) => setUserGuess(Number(event.target.value))}/>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Indovina
                        </Button>
                    </form>
            }


            <AlertDialog open={showedResult != null}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Risultato</AlertDialogTitle>
                        <AlertDialogDescription>
                            {getRisultatoText(showedResult!)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => {
                            setShowedResult(null)
                        }}>Chiudi</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </>
    )
}

export default App
