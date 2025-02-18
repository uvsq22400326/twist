"use client";

import './profil.css'
import '../grid.css'
import { env } from 'node:process';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PostArea from "./postArea"
import AbonnementArea from './abonnementArea';

export default function Profil() {
    const router = useRouter();
    useEffect(() => {
        const token = sessionStorage.getItem("token");

        // Si pas de token, rediriger vers la page de login
        if (!token) {
        console.log("Token manquant, redirection vers login");
        router.push("/login");
        }
    }, [router]);
    /* On prend la ref de l'image de profil de 
     * l'utilisateur dans la base.
     * On charge l'image correspondante (pour l'instant image du site)*/
    
    const img_reference = 'favicon.ico';
    return <div>
            <div id='profile_img_box' style={{
                backgroundImage : 'url(' + img_reference + ')'}}>
            </div>
            <div className='row'>
                <div id='mes_posts_container' className='col-4'>
                    <h1>Mes posts</h1>
                    {PostArea()}
                </div>
                <div id='mes_abonnements' className='col-4'>
                    <h1>Mes abonnements</h1>
                    {AbonnementArea()}
                </div>
                <div id='mes_followers' className='col-4'>
                    <h1>Mes followers</h1>
                </div>
            </div>         
    </div>
}