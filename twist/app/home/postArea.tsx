import useSWR from "swr";

import "./home.css"

export default function PostArea() {
    const fetcher = (url) => fetch(url).then(res => {
        console.log('res = ' + res);
        let r = res.json().then((_res) => {
            console.log(_res);
            let rows = _res.content;
            /*return (
                <div>
                    <h1>Twists</h1>
                    {rows.map((row) => {
                        <div className="post-box">
                            <p>{row.id}</p>
                            <p>{row.content}</p>
                            <p>{row.user_id}</p>
                        </div>
                    })}
                </div>             
            )*/
           return rows;
        });
        console.log('r = ' + r);
        return r;
      });
    
    const { data, error, isLoading} = useSWR("/api/home/posts", fetcher);
    if (isLoading) return (<div>
        <p>Chargement des messages...</p>
    </div>)
    if (error) return (<div>
        <p>Erreur</p>
    </div>)
    console.log('data = ' + data[0].id);
    return (
      <div id="post-container">
        <h1>Twists</h1>
        <div>
        {[...Array(data.length)].map((_, i) => (
            <div className="post-box">
                <p>{data[i].id}</p>
                <p>{data[i].content}</p>
            </div>
        ))}
        </div>
      </div>);
}