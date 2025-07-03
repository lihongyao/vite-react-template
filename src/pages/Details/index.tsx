import { Link } from "react-router";

export default function Page() {
  return (
    <div className="page">
      <div className="coming-soon">Demo Example</div>
      <div className="text-center text-20 mt-20">
        <Link to="/">Go Home</Link>
      </div>
    </div>
  );
}
