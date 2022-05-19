import { useState } from "react";
import { useQuery } from "react-query";
import { IssueItem } from "./IssueItem";

export default function IssuesList({ labels, status, page, setPage }) {
  const [searchValue, setSearchValue] = useState("");

  const issuesQuery = useQuery(
    ["issues", { labels, status, page }],
    () => {
      const statusString = status ? `&status=${status}` : "";
      const labelsString = labels.map((label) => `labels[]=${label}`).join("&");
      const currentPageString = page ? `&page=${page}` : "";
      return fetch(`/api/issues?${labelsString}${statusString}${currentPageString}`).then((res) => res.json());
    },
    {
      keepPreviousData: true,
    }
  );

  const searchQuery = useQuery(
    ["issues", "search", searchValue, page],
    () => fetch(`/api/search/issues?q=${searchValue}`).then((res) => res.json()),
    {
      enabled: searchValue.length > 0,
    }
  );

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearchValue(e.target.elements.search.value);
        }}
      >
        <label htmlFor="search">Searhc Issues</label>
        <input id="search" type="text" name="search" placeholder="Search..." />
      </form>
      {issuesQuery.isLoading ? (
        <p>Loading...</p>
      ) : searchQuery.fetchStatus === "idle" && searchQuery.isLoading ? (
        <>
          <ul className="issues-list">
            {issuesQuery.data.map((issue) => (
              <IssueItem
                key={issue.id}
                title={issue.title}
                number={issue.number}
                assignee={issue.assignee}
                commentCount={issue.comments.length}
                createdBy={issue.createdBy}
                createdDate={issue.createdDate}
                labels={issue.labels}
                status={issue.status}
              />
            ))}
          </ul>
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => {
                if (page - 1 > 0) {
                  setPage(page - 1);
                }
              }}
            >
              Previous
            </button>
            <p>
              Page {page}
              {issuesQuery.isFetching ? "..." : ""}
            </p>
            <button
              disabled={issuesQuery.isPreviousData || issuesQuery.data.length === 0}
              onClick={() => {
                if (issuesQuery.data.length > 0 && !issuesQuery.isPreviousData) {
                  setPage(page + 1);
                }
              }}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>Search Results</h2>
          {searchQuery.isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>{searchQuery.data.count} results</p>
              <ul className="issues-list">
                {searchQuery.data.items.map((issue) => (
                  <IssueItem
                    key={issue.id}
                    title={issue.title}
                    number={issue.number}
                    assignee={issue.assignee}
                    commentCount={issue.comments.length}
                    createdBy={issue.createdBy}
                    createdDate={issue.createdDate}
                    labels={issue.labels}
                    status={issue.status}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
