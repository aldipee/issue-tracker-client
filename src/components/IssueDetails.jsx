import { useQuery, useInfiniteQuery } from "react-query";
import { useParams } from "react-router-dom";
import { relativeDate } from "../helpers/relativeDate";
import { useUserData } from "../helpers/useUserData";

import { IssueHeader } from "./useIssueData";
import IssueStatus from "./IssueStatus";
import IssueAssignment from "./IssueAssignment";
import useScrollToBottom from "./../helpers/useScrollToBottomAction";
import Loader from "./Loader";

function useIssueData(issueNumber) {
  return useQuery(["issue", issueNumber], () => {
    return fetch(`/api/issues/${issueNumber}`).then((res) => res.json());
  });
}

function useIssueComments(issueNumber) {
  return useInfiniteQuery(
    ["issue", issueNumber, "comments"],
    ({ pageParam = 1 }) => {
      return fetch(`/api/issues/${issueNumber}/comments?page=${pageParam}`).then((res) => res.json());
    },
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) return;
        return pages.length + 1;
      },
    }
  );
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

  useScrollToBottom(document, commentsQuery.fetchNextPage, 100);

  if (issueQuery.isLoading) return <p>Loading...</p>;

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
            : commentsQuery.data?.pages.map((commentPage) =>
                commentPage.map((comment) => <Comment key={comment.id} {...comment} />)
              )}
          {commentsQuery.isFetchingNextPage && <Loader />}
        </section>
        <aside>
          <IssueStatus status={issueQuery.data.status} issueNumber={issueQuery.data.number.toString()} />
          <IssueAssignment assignee={issueQuery.data.assignee} issueNumber={issueQuery.data.number.toString()} />
        </aside>
      </main>
    </div>
  );
}
