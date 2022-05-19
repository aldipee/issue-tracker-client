import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { relativeDate } from "../helpers/relativeDate";
import { useUserData } from "../helpers/useUserData";

import { IssueHeader } from "./useIssueData";
import IssueStatus from "./IssueStatus";
import IssueAssignment from "./IssueAssignment";

function useIssueData(issueNumber) {
  return useQuery(["issue", issueNumber], () => {
    return fetch(`/api/issues/${issueNumber}`).then((res) => res.json());
  });
}

function useIssueComments(issueNumber) {
  return useQuery(["issue", issueNumber, "comments"], () => {
    return fetch(`/api/issues/${issueNumber}/comments`).then((res) => res.json());
  });
}

function Comment({ comment, createdBy, createdDate }) {
  const userDataQuery = useUserData(createdBy);

  if (userDataQuery.isLoading) {
    return (
      <div className="comment">
        <div>
          <div className="comment-header">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="comment">
      <img src={userDataQuery.data.profilePictureUrl} alt={userDataQuery.data.name} />
      <div>
        <div className="comment-header">
          <span>{userDataQuery.data.name}</span> <span>{relativeDate(createdDate)}</span>
        </div>
        <div className="comment-body">{comment}</div>
      </div>
    </div>
  );
}

export default function IssueDetails() {
  const { number } = useParams();
  const issueQuery = useIssueData(number);
  const commentsQuery = useIssueComments(number);

  if (issueQuery.isLoading) return <p>Loading...</p>;

  console.log(issueQuery.data, "issueQuery.data");
  return (
    <div className="issue-details">
      <IssueHeader
        title={issueQuery.data.title}
        number={issueQuery.data.number}
        status={issueQuery.data.status}
        createdBy={issueQuery.data.createdBy}
        createdDate={issueQuery.data.createdDate}
        comments={issueQuery.data.comments}
      />
      <main>
        <section>
          {commentsQuery.isLoading
            ? "Loading..."
            : commentsQuery.data.map((comment) => <Comment key={comment.id} {...comment} />)}
        </section>
        <aside>
          <IssueStatus status={issueQuery.data.status} issueNumber={issueQuery.data.number.toString()} />
          <IssueAssignment assignee={issueQuery.data.assignee} issueNumber={issueQuery.data.number.toString()} />
        </aside>
      </main>
    </div>
  );
}
