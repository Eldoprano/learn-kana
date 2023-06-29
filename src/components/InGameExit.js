import React from 'react'
import { Outlet, Link } from "react-router-dom";

export default function InGameExit() {
    return (
        <Link to='/learn-kana'>
            <div>Exit</div>
        </Link>)
}
