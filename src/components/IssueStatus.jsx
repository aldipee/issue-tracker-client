import { useMutation, useQueryClient } from "react-query";
import { StatusSelect } from "../components/StatusSelect";

export default function IssueStatus({ status, issueNumber }) {
  const queryClient = useQueryClient();
  const setStatusUpdate = useMutation(
    (issueStatus) => {
      fetch(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ status: issueStatus }),
      }).then((res) => res.json());
    },
    {
      // On mutate is fire before the request is sent
      // So we can use this to update the "status" on the cached data
      onMutate: (issueStatus) => {
        //Get the cached data
        const cachedData = queryClient.getQueryData(["issue", issueNumber]);

        // Then update the status on the cached data
        queryClient.setQueryData(["issue", issueNumber], (prevData) => ({
          ...prevData,
          status: issueStatus,
        }));

        console.log(cachedData, "cachedData");

        // And when error happened we can update the status on the cached data to the previous status a.k.a. rollback
        return function rollback() {
          queryClient.setQueryData(["issue", issueNumber], (prevData) => ({
            ...prevData,
            status: cachedData.status,
          }));
        };
      },
      onError: (error, varibels, rollback) => {
        rollback();
      },
      // Triggered when the request is finished (error or success)
      onSettled: () => {
        queryClient.invalidateQueries(["issue", issueNumber], { exact: true });
      },
    }
  );

  console.log("statusValue", status);

  return (
    <div className="issue-options">
      <div>
        <span>Status</span>
        <StatusSelect
          value={status}
          onChange={(e) => {
            console.log(e.target.value, "asdsadsd");
            setStatusUpdate.mutate(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
