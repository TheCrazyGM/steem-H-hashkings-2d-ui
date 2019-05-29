import React, {useContext, useState, useEffect, useRef} from "react";
import {Button} from "primereact/button";
import {HashkingsAPI} from "../service/HashkingsAPI";
import {StateContext} from "../App";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Checkbox} from "primereact/checkbox";

export default function() {
  const {username} = useContext(StateContext);
  const payoutsTable = useRef(null);
  const landPurchasesTable = useRef(null);
  const seedPurchasesTable = useRef(null);

  const [recentPayouts, setRecentPayouts] = useState([]);
  const [recentLandPurchases, setRecentLandPurchases] = useState([]);
  const [recentSeedPurchases, setRecentSeedPurchases] = useState([]);
  const [oldestId, setOldestId] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [noMoreHistory, setNoMoreHistory] = useState(false);
  const [steemPerVest, setSteemPerVest] = useState(0);
  const [fetchAll, setFetchAll] = useState(false);

  const [oldestDate, setOldestDate] = useState(
    new Date(Date.now()).toDateString()
  );

  const hashkingsApi = new HashkingsAPI();

  useEffect(() => {
    if (username) {
      setLoading(true);
      hashkingsApi.getDGPO().then(dgpo => {
        const spv =
          parseFloat(dgpo.total_vesting_fund_steem.split(" ")[0]) /
          parseFloat(dgpo.total_vesting_shares.split(" ")[0]);

        setSteemPerVest(spv);

        hashkingsApi
          .getAccountHistory(spv, username, false)
          .then(
            ({payouts, oldestId, stop, date, landPurchases, seedPurchases}) => {
              setOldestId(oldestId);
              setRecentPayouts(payouts);
              setRecentLandPurchases(landPurchases);
              setRecentSeedPurchases(seedPurchases);

              if (stop) {
                setNoMoreHistory(true);
              }

              if (date) {
                setOldestDate(date);
              }

              setLoading(false);
            }
          );
      });
    }
  }, [username]);

  function blockTemplate(data) {
    const trx_id = data.trx_id || "0000000000000000000000000000000000000000";

    return (
      <a href={`https://steemd.com/b/${data.block}#${trx_id}`}>{data.block}</a>
    );
  }

  function fetchMore() {
    setLoading(true);
    hashkingsApi
      .getAccountHistory(steemPerVest, username, fetchAll, oldestId)
      .then(({payouts, oldestId, stop, date, landPurchases, seedPurchases}) => {
        setOldestId(oldestId);
        setRecentPayouts([...recentPayouts, ...payouts]);
        setRecentLandPurchases([...recentLandPurchases, ...landPurchases]);
        setRecentSeedPurchases([...recentSeedPurchases, ...seedPurchases]);

        if (stop) {
          setNoMoreHistory(true);
        }

        if (date) {
          setOldestDate(date);
        }

        setLoading(false);
      })
      .catch(e => {
        console.log(e);
        setLoading(false);
      });
  }

  if (!username) {
    return (
      <div className="card-blank">
        <div className="p-fluid">
          <div className="p-col-12">
            <h1>
              <b>
                <u>Please sign in to see your stats</u>
              </b>
            </h1>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="card-blank">
        <div className="p-fluid">
          <div className="p-col-12">
            <h1>
              <b>
                <u>Stats</u>
              </b>
            </h1>
            <br />
            <p>
              Here is where you can see all of your stats such as historic
              payouts
            </p>
          </div>
          <div className="p-col-12">
            <div className="card-weedLeft card-w-title">
              <h1 className="section-heading">
                Payouts (since {oldestDate}){" "}
                <Button
                  className="export-stats"
                  disabled={loading}
                  label="Export as CSV"
                  onClick={() => payoutsTable.current.exportCSV()}
                />
              </h1>
              <DataTable
                value={recentPayouts}
                loading={loading}
                responsive={true}
                emptyMessage="No payouts found"
                ref={payoutsTable}
              >
                <Column field="timestamp" header="Date" sortable={true} />
                <Column
                  field="sp_payout"
                  header="STEEM Power Payout"
                  sortable={true}
                />
                <Column
                  field="sbd_payout"
                  header="SBD Payout"
                  sortable={true}
                />
                <Column
                  field="steem_payout"
                  header="STEEM Payout"
                  sortable={true}
                />
                <Column
                  field="block"
                  header="Block"
                  sortable={true}
                  body={blockTemplate}
                />
              </DataTable>
              <h1 className="section-heading">
                Land purchases (since {oldestDate})
                <Button
                  className="export-stats"
                  disabled={loading}
                  label="Export as CSV"
                  onClick={() => landPurchasesTable.current.exportCSV()}
                />
              </h1>
              <DataTable
                value={recentLandPurchases}
                loading={loading}
                emptyMessage="No purchases found"
                responsive={true}
                ref={landPurchasesTable}
              >
                <Column field="timestamp" header="Date" sortable={true} />
                <Column field="region" header="Region" filter={true} />
                <Column field="amount" header="Amount" sortable={true} />
                <Column
                  field="block"
                  header="Block"
                  sortable={true}
                  body={blockTemplate}
                />
              </DataTable>
              <h1 className="section-heading">
                Seed purchases (since {oldestDate})
                <Button
                  className="export-stats"
                  disabled={loading}
                  label="Export as CSV"
                  onClick={() => seedPurchasesTable.current.exportCSV()}
                />
              </h1>
              <DataTable
                value={recentSeedPurchases}
                loading={loading}
                emptyMessage="No purchases found"
                responsive={true}
                ref={seedPurchasesTable}
              >
                <Column field="timestamp" header="Date" sortable={true} />
                <Column field="strain" header="Strain" filter={true} />
                <Column field="type" header="Type" filter={true} />
                <Column field="amount" header="Amount" sortable={true} />
                <Column
                  field="block"
                  header="Block"
                  sortable={true}
                  body={blockTemplate}
                />
              </DataTable>
              <div id="fetch-all-history">
                <Checkbox
                  inputId="fetchAll"
                  onChange={() => setFetchAll(!fetchAll)}
                  checked={fetchAll}
                  disabled={loading || noMoreHistory}
                />
                <label htmlFor="fetchAll" className="p-checkbox-label">
                  {" "}
                  Load all history (can take a while)
                </label>
              </div>
              <Button
                className="load-history"
                disabled={loading || noMoreHistory}
                label={
                  noMoreHistory
                    ? "No more history"
                    : loading
                    ? "Loading More"
                    : "Load More"
                }
                onClick={fetchMore}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}