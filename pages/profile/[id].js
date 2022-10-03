import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { client, getProfile, getPublications } from "../../api"
import Image from "next/image";
import ABI from "../../abi.json";
import { ethers } from "ethers";

const address = "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d";

export default function Profile() {
    const [profile, setProfile] = useState();
    const [publications, setPublications] = useState([]);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if(id) {
            fetchProfile()
        }
    }, [id])

    async function fetchProfile() {
        try {
            const user = await client.query(getProfile, { id }).toPromise();
            setProfile(user.data.profile);
            console.log(user);

            const publications = await client.query(getPublications, { id }).toPromise();
            setPublications(publications.data.publications.items)
            console.log(publications);
        } catch (error) {
            console.log(error);
        }
    }

    async function connect() {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        })
        console.log({ accounts })
    }

    async function followUser() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(address, ABI, signer);

        try {
            const tx = await contract.follow(
                [id], [0x0]
            )
            await tx.wait();
            console.log("Followed user successfully!");
        } catch (error) {
            console.log(error);
        }
    }

    if(!profile) return null;

    return (
        <div>
            <div>
                <button onClick={connect}>Connect wallet</button>
            </div>
            {
                profile.picture ? (
                    <Image
                      src={profile.picture.original?.url}
                      width="200px"
                      height="200px"
                    />
                  ) : (
                    <div style={{ width: "200px", height: "200px", backgroundColor: "purple" }} />
                  )
            }
            <div>
                <h4>{profile.handle}</h4>
                <p>{profile.bio}</p>
                <p>Followers: {profile.stats.totalFollowers}</p>
                <p>Following: {profile.stats.totalFollowing}</p>
            </div>
            <div>
                <button onClick={followUser}>Follow</button>
            </div>
            <div>
                {
                    publications.map((publication, index) => (
                        <div key={index} style={{ padding: '20px', borderTop: '1px solid white'}}>
                            {publication.metadata.content}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}