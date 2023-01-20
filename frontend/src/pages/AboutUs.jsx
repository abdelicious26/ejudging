import React from 'react';

function AboutUs() {

    return (
        <>
            <div>
                <section className='heading'>
                    <h3>
                        <p>User Guide</p>
                    </h3>
                </section>
                <div>
                    <iframe src="/About-Us.pdf" frameborder="0" width='100%' height='720px'></iframe>
                </div>
            </div>
        </>
    )
}

export default AboutUs