import './profil.css'
import '../grid.css'
import { env } from 'node:process';

export default function Profile() {

    /* On prend la ref de l'image de profil de 
     * l'utilisateur dans la base.
     * On charge l'image correspondante */
    
    const img_reference = 'favicon.ico';
    return <div>
            <div id='profile_img_box' style={{
                backgroundImage : 'url(' + img_reference + ')'}}>
            </div>
            <div className='row'>
                <div id='mes_posts_container' className='col-4'>
                    <h1>Mes posts</h1>           
                </div>
                <div id='mes_abonnements' className='col-4'>
                    <h1>Mes abonnements</h1>
                </div>
                <div id='mes_followers' className='col-4'>
                    <h1>Mes followers</h1>
                </div>
            </div>
            
            
    </div>
}