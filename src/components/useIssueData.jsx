import { useQuery } from "react-query";
import { GoIssueOpened, GoIssueClosed } from "react-icons/go";
import { possibleStatus } from "../helpers/defaultData";
import { useUserData } from "../helpers/useUserData";
import { relativeDate } from "../helpers/relativeDate";

export function IssueHeader({ title, number, status = "todo", createdBy, createdDate, comments }) {
  const statusObj = possibleStatus.find((item) => item.id === status);
  const userData = useUserData(createdBy);

  return (
    <header>
      <h2>
        {title} <span>#{number}</span>
      </h2>
      <div>
        <span className={status === "done" || status === "cancelled" ? "closed" : "open"}>
          {status == "done" || status === "cancelled" ? <GoIssueClosed /> : <GoIssueOpened />}
          {statusObj.label}
        </span>
        <span className="created-by">{userData.isLoading ? "..." : userData.data.name}</span> opened this issue on{" "}
        {relativeDate(createdDate)} - {comments.length} comments
      </div>
    </header>
  );
}
