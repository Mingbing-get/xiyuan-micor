import React from 'react';
import './index.css';

import { Card } from 'antd';

const { Meta } = Card;

class ShowCard extends React.Component {
    shouldComponentUpdate(newprops){
        if (this.props.data===newprops.data){
            return false;
        }
        return true;
    }
    render() {
        let justify = 'space-around';
        let width = null;
        let border = true;
        let hoverable = true;
        let cards = [];
        if (this.props.data && this.props.data.cpdata){
            if (this.props.data.cpdata.style){
                justify = this.props.data.cpdata.style.justify||justify;
                width = this.props.data.cpdata.style.width||width;
                border = this.props.data.cpdata.style.border !== 'no-border';
                hoverable = this.props.data.cpdata.style.hoverable !== 'no-hoverable';
            }
            cards = this.props.data.cpdata.cards || [];
        }
        return (
            <div
                className='card-show-box'
                style={{justifyContent:justify}}
            >
                {
                    cards.map((value,index) => {

                        return (
                            <Card
                                key={index}
                                title={value.title}
                                style={{ width: width,maxWidth:'100%', boxSizing:'border-box' }}
                                bordered={border}
                                hoverable={hoverable}
                                cover={value.cover &&
                                    <img src={value.cover.path} />}
                            >
                                {
                                    (value.subTitle || value.discription) &&
                                        <Meta title={value.subTitle} description={value.discription} />
                                }
                                {
                                    value.content &&
                                        <p>{value.content}</p>
                                }
                            </Card>
                        )
                    })
                }
            </div>
        );
    }
}

ShowCard.elementName = 'ShowCard';
export default ShowCard;