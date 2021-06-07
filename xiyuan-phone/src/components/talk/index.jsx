import React, {useRef, useEffect, useState} from 'react';
import './index.css';
import TalkItem from './talkItem';

import { Input, Button } from 'antd';

function Talk({...props}) {
    const content = useRef(null);
    const inputRef = useRef(null);
    const fangdou = useRef(null);
    const fangdou1 = useRef(null);
    const [more, setMore] = useState(true);
    const [notReadCount, setNotReadCount] = useState(0);
    const loading = useRef(false);
    const newmessage = useRef(false);
    const [value, setValue] = useState('');
    const [disable, setDisable] = useState(false);

    useEffect(()=>{
        //初始化content的高度
        content.current.style.height = document.documentElement.clientHeight-77+'px';
        if (!props.loadMore){
            setMore(false);
            return;
        }
        //绑定滚动事件，处理上拉刷新
        content.current.onscroll = ()=>{
            if (content.current.scrollTop === 0){
                fangdou.current && clearTimeout(fangdou.current);
                fangdou.current = setTimeout(()=>{
                    if (props.loadMore){
                        let preHight = content.current.scrollHeight;
                        setLoading(true);
                        props.loadMore(()=>{
                            content.current.scrollTop = content.current.scrollHeight-preHight;
                        });
                    }
                    else {
                        setMore(false);
                    }
                },200);
            }
            if (content.current.scrollTop+content.current.clientHeight<content.current.scrollHeight-20){
                fangdou1.current && clearTimeout(fangdou1.current);
                fangdou1.current = setTimeout(()=>{
                    setNewmessage(true);
                },200);
            }
            else {
                fangdou1.current && clearTimeout(fangdou1.current);
                fangdou1.current = setTimeout(()=>{
                    setNewmessage(false);
                    setNotReadCount(0);
                },200);
            }
        };
        window.onresize = ()=>{
            content.current.style.height = document.documentElement.clientHeight-77+'px';
        };
        return ()=>{
            fangdou.current && clearTimeout(fangdou.current);
            fangdou1.current && clearTimeout(fangdou1.current);
            window.onresize = null;
        }
    },[]);

    useEffect(()=>{
        setMore(props.more);
    },[props.more]);

    useEffect(()=>{
        if (props.children.length === 0 || loading.current){
            setLoading(false);
            return;
        }
        if (newmessage.current)
            setNotReadCount(notReadCount+1);
        else{
            content.current.scrollTop = content.current.scrollHeight;
        }
    },[props.children]);

    function setLoading(bool) {
        loading.current = bool;
    }

    function setNewmessage(bool) {
        newmessage.current=bool;
    }

    function send() {
        setDisable(true);
        setValue('');
        inputRef.current.focus();
        props.send(value);
        setDisable(false);
    }

    function inputKeyUp(e) {
        if (e.keyCode === 13){
            send();
        }
    }

    return (
        <div className='talk-box'>
            {
                props.header !== false?
                    props.header?
                        props.header
                        :
                        <div className='talk-header'>{props.title}</div>
                    :
                    ''
            }
            <div className='talk-content' ref={content}>
                <div className='talk-content-more'>
                    {
                        more?
                            '加载更多...'
                            :
                            '没有更多'
                    }
                </div>
                {props.children}
            </div>
            {
                props.footer !== false?
                    props.footer?
                        props.footer
                        :
                        <div className='talk-footer'>
                            {
                                notReadCount !== 0&&
                                <span>{notReadCount}</span>
                            }
                            <div className='talk-footer-input-box'>
                                <Input
                                    value={value}
                                    onChange={(e)=>{setValue(e.target.value)}}
                                    onKeyUp={(e)=>{inputKeyUp(e)}}
                                    ref={inputRef}
                                    disabled={props.disabled}
                                />
                                <Button
                                    type='primary'
                                    onClick={()=>{send()}}
                                    disabled={props.disabled || disable}
                                >发送</Button>
                            </div>
                        </div>
                    :
                    ''
            }
        </div>
    );
}

Talk.TalkItem = TalkItem;

export default Talk;