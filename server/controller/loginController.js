import fetch from "node-fetch";
import express from "express";

async function fetchJSON(url,options){
    const res = await fetch(url, options);
    if (!res.ok){
        throw new Error(`Failed ${res.status}`)
    }
    return await res.json();
}

