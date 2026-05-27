interface ICacheItem {
  key: string | number;
  value: any;
}

export class CacheQueue {
  private queue: ICacheItem[] = [];
  private maxLength: number;

  constructor(maxLength: number = 10) {
    this.maxLength = maxLength;
  }

  get(key: string | number): ICacheItem | undefined {
    const index = this.queue.findIndex((item) => item.key === key);
    if (index !== -1) {
      // 命中缓存，将该项移动到队尾
      const [item] = this.queue.splice(index, 1);
      this.queue.push(item);
      return item;
    }
    return undefined;
  }

  set(key: string | number, value: any) {
    const index = this.queue.findIndex((item) => item.key === key);
    if (index !== -1) {
      // 更新缓存
      this.queue[index] = { key, value };
    } else {
      // 添加新缓存
      const newCacheItem = {
        key,
        value,
      };
      this.queue.push(newCacheItem);
      // 超出长度，移除头部元素
      if (this.queue.length > this.maxLength) {
        this.queue.shift();
      }
    }
  }
}
