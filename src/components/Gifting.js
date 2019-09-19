import React, {useContext} from "react";
import {StateContext} from "../App";
import GiftSeed from "./GiftSeed";

export default function() {
  const {username} = useContext(StateContext);

  if (!username) {
    return (
      <div className="card-blank-sand-3">
        <div className="p-fluid">
          <div className="p-col-12">
            <h1>
              <a href="/login">
              <b>
                <u>Please sign in to see your Farm</u>
              </b></a>
            </h1>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="card-blank-sand-3">
        <div className="p-fluid">
          <div className="p-col-12">
              <div className="p-col-12">
            <h1><b><font color="#FFC897">This is your one stop shop for gifting and sending seeds to your friends.</font></b></h1>
			  </div>
          </div>
          <div className="p-col-12">
            <div className="card-weedLeft card-w-title">
              <GiftSeed />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
