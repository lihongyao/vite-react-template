import { useMount } from "ahooks";
import { Link } from "react-router";

export default function Page() {
  useMount(() => {
    document.title = "权益";
  });
  return (
    <div className="tab-page">
      <div className="coming-soon">Demo Example</div>
      <div className="text-center text-20 mt-20">
        <Link to="/details">Go Details</Link>
      </div>
    </div>
  );
}
