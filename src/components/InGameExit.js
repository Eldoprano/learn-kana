import React from 'react'
import { Outlet, Link } from "react-router-dom";

export default function InGameExit() {
    return (
        <Link to='/'>
            <div>Exit</div>
        </Link>)
}
