import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <div className="landing">
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo" />
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
                <i>Error Message: </i>{error.statusText || error.message}
            </p>
        </div>
    );
}
