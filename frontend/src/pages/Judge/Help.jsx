import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function Help() {
    const { user } = useSelector((state) => state.auth);
    let token;
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
        else if (user && user.recordType !== 'admin') {
            navigate('/judge')
        }
        else {
            token = user.token
        }
    }, [user])

    return (
        <>
            <div>
                <section className='heading'>
                    <h3>
                        <p>User Guide</p>
                    </h3>
                </section>
                <div>
                    {user.recordType === 'admin' ? (
                        <iframe src="/Guide-for-Admin.pdf" frameborder="0" width='100%' height='720px'></iframe>
                    ) : (
                        <iframe src="/Guide-for-Judges.pdf" frameborder="0" width='100%' height='720px'></iframe>
                    )}
                </div>
            </div>
        </>
    )
}

export default Help