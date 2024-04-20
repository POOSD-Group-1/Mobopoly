import "../styles.css";
import { ErrorOutline } from "@mui/icons-material";

function ErrorMessage({ error }) {
  return <div className="error-box">
    <ErrorOutline className="error-icon" />
    {error}
  </div>;
}

export default ErrorMessage;
