'use client'
 
import { Suspense } from 'react'
import SearchPage from './SearchPage'
import React from 'react'

export default function SearchPageMain() {
    return <Suspense>
        <SearchPage />
    </Suspense>
}