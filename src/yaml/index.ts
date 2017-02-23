import {Provider} from '@samizdatjs/tiamat';
import {Serializer} from '@samizdatjs/tashmetu';
import {YamlSerializer} from './serializer';
import {YamlConfig} from './meta';
import {merge} from 'lodash';

const defaultOptions: YamlConfig = {
  frontMatter: false,
  indent: 2
};

export function yaml(config?: YamlConfig) {
  return (provider: Provider): Serializer => {
    return new YamlSerializer(merge({}, defaultOptions, config || {}));
  };
}
