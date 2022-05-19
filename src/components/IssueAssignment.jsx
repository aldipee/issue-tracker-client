import { useUserData } from "../helpers/useUserData";
import { GoGear } from "react-icons/go";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

export default function IssueAssignment({ assignee, issueNumber }) {
  const user = useUserData(assignee);
  const [menuOpen, setMenuOpen] = useState(false);
  const usersQuery = useQuery(["users"], () => fetch("/api/users").then((res) => res.json()));

  const queryClient = useQueryClient();

  const setAssignment = useMutation(
    (assignee) => {
      fetch(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ assignee }),
      }).then((res) => res.json());
    },
    {
      onMutate: (assignee) => {
        const oldAssignee = queryClient.getQueryData(["issue", issueNumber]).assignee;
        queryClient.setQueryData(["issue", issueNumber], (data) => ({
          ...data,
          assignee,
        }));

        return function rollback() {
          queryClient.setQueryData(["issue", issueNumber], (data) => ({
            ...data,
            assignee: oldAssignee,
          }));
        };
      },
      onError: (error, variables, rollback) => {
        rollback();
      },
      onSettled: () => {
        queryClient.invalidateQueries(["issue", issueNumber], { exact: true });
      },
    }
  );

  return (
    <div className="issue-options">
      <div>
        <span>Assignment</span>
        {user.isSuccess && (
          <div>
            <img src={user.data.profilePictureUrl} />
            {user.data.name}
          </div>
        )}
      </div>
      <GoGear onClick={() => !usersQuery.isLoading && setMenuOpen((open) => !open)} />
      {menuOpen && (
        <div className="picker-menu">
          {usersQuery.data?.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                setMenuOpen(false);
                setAssignment.mutate(user.id);
              }}
            >
              <img src={user.profilePictureUrl} />
              {user.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
