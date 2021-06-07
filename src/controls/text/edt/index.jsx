import React from 'react';
import './index.css';

import { Editor } from '@tinymce/tinymce-react';

class EdtText extends React.Component {
    //修改文本
    updateText = (content)=>{
        this.updateData({cpdata:{text:content}});
    };

    updateData = (newdata)=>{
        this.props.updateData &&
        this.props.updateData(this.props.index, {
            ...this.props.data,
            ...newdata
        });
    };
    render(){
        return(
            <Editor
                initialValue={this.props.data && this.props.data.cpdata && this.props.data.cpdata.text}
                init={{
                    height: 200,
                    menubar: true,
                    language: "zh_CN",
                    color_cols: 7,
                    plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste wordcount',
                        'charmap hr emoticons fullscreen quickbars ',
                        'codesample'
                    ],
                    toolbar: ''
                }}
                onEditorChange={this.updateText}
            />
        );
    }
}

EdtText.showTitle='文本';

export default EdtText;